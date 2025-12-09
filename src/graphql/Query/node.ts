import { TodoId } from "../../models/todo.ts";
import { UserId } from "../../models/user.ts";
import type { QueryResolvers } from "../../schema.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { badUserInputErr } from "../_errors/badUserInput.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { parseId } from "../_parsers/id.ts";
import * as Todo from "../Todo/_node.ts";
import * as User from "../User/_node.ts";

export const typeDef = /* GraphQL */ `
  extend type Query {
    node(id: ID!): Node @complexity(value: 3)
  }
`;

export const resolver: QueryResolvers["node"] = async (_parent, args, context) => {
  const authed = authAuthenticated(context);

  if (authed instanceof Error) {
    throw forbiddenErr(authed);
  }

  const id = parseId(args.id);

  if (id instanceof Error) {
    throw badUserInputErr(id.message, id);
  }

  const { type, internalId } = id;

  const pairs = {
    Todo: [TodoId.is, Todo.getNode],
    User: [UserId.is, User.getNode],
  } as const;

  const [isInternalId, getNode] = pairs[type];

  if (!isInternalId(internalId)) {
    throw badUserInputErr(`Invalid global id '${args.id}'`);
  }

  // @ts-expect-error: 分岐を書くのが面倒だったので…
  const node = await getNode(context)(internalId);

  return node == null ? null : { type, ...node };
};
