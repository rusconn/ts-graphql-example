import { Todo, User } from "../../domain/models.ts";
import { unwrapOrElse } from "../../util/neverthrow.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { badUserInputErr } from "../_errors/badUserInput.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { parseId } from "../_parsers/id.ts";
import type { QueryResolvers } from "../_schema.ts";
import * as todo from "../Todo/_node.ts";
import * as user from "../User/_node.ts";

export const typeDef = /* GraphQL */ `
  extend type Query {
    node(id: ID!): Node @complexity(value: 3)
  }
`;

export const resolver: QueryResolvers["node"] = async (_parent, args, context) => {
  const ctx = authAuthenticated(context);
  if (Error.isError(ctx)) {
    throw forbiddenErr(ctx);
  }

  const id = unwrapOrElse(parseId(args.id), (e) => {
    throw badUserInputErr(e.message, e);
  });

  const { type, internalId } = id;

  const [isInternalId, getNode] = pairs[type];
  if (!isInternalId(internalId)) {
    throw badUserInputErr(`Invalid global id '${args.id}'`);
  }

  // @ts-expect-error: 分岐を書くのが面倒だったので…
  const node = await getNode(ctx, internalId);

  return node == null ? null : { type, ...node };
};

const pairs = {
  Todo: [Todo.Id.is, todo.getNode],
  User: [User.Id.is, user.getNode],
} as const;
