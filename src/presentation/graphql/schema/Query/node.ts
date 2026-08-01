import { Todo, User } from "../../../../domain/entities.ts";
import { unwrapOrElse } from "../../../../lib/neverthrow-extra.ts";
import type { ContextForAuthed } from "../../yoga/context.ts";
import { badUserInputError } from "../_errors/global/bad-user-input.ts";
import { parseId } from "../_parsers/id.ts";
import type { QueryResolvers } from "../_types.ts";
import * as todo from "../Todo/_node.ts";
import * as user from "../User/_node.ts";

export const typeDef = /* GraphQL */ `
  extend type Query {
    node(id: ID!): Node @complexity(value: 3) @auth(policy: AUTHENTICATED)
  }
`;

export const resolver: QueryResolvers["node"] = async (_parent, args, context) => {
  const ctx = context as ContextForAuthed;

  const id = unwrapOrElse(parseId(args.id), (e) => {
    throw badUserInputError(e.message, e);
  });

  const { type, internalId } = id;

  const [isInternalId, getNode] = pairs[type];
  if (!isInternalId(internalId)) {
    throw badUserInputError(`Invalid global id '${args.id}'`);
  }

  // @ts-expect-error: 分岐を書くのが面倒だったので…
  const node = await getNode(ctx, internalId);

  return node == null ? null : { _type: type, ...node };
};

const pairs = {
  Todo: [Todo.Id.is, todo.getNode],
  User: [User.Id.is, user.getNode],
} as const;
