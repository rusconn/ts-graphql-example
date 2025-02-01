import * as TodoId from "../../db/models/todo/id.ts";
import * as UserId from "../../db/models/user/id.ts";
import type { QueryResolvers } from "../../schema.ts";
import * as Todo from "../Todo/_node.ts";
import * as User from "../User/_node.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { badUserInputErr } from "../_errors/badUserInput.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { parseId } from "../_parsers/id.ts";

export const typeDef = /* GraphQL */ `
  extend type Query {
    node(id: ID!): Node
  }
`;

export const resolver: QueryResolvers["node"] = async (_parent, args, context) => {
  const authed = authAuthenticated(context);

  if (authed instanceof Error) {
    throw forbiddenErr(authed);
  }

  const parsed = parseId(args);

  if (parsed instanceof Error) {
    throw badUserInputErr(parsed.message, parsed);
  }

  const { type, internalId } = parsed;

  const pairs = {
    Todo: [TodoId.is, Todo.getNode],
    User: [UserId.is, User.getNode],
  } as const;

  const [isInternalId, getNode] = pairs[type];

  if (!isInternalId(internalId)) {
    throw badUserInputErr(`invalid node id: ${args.id}`);
  }

  // @ts-expect-error: 分岐を書くのが面倒だったので…
  const node = await getNode(context)(internalId);

  return node == null ? null : { type, ...node };
};
