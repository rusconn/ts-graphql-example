import { unwrapOrElse } from "../../../../lib/neverthrow-extra.ts";
import type { ContextForAuthed } from "../../yoga/context.ts";
import { badUserInputError } from "../_errors/global/bad-user-input.ts";
import { parseTodoId } from "../_parsers/todo/id.ts";
import type { UserResolvers } from "../_types.ts";

export const typeDef = /* GraphQL */ `
  extend type User {
    todo(id: ID!): Todo @complexity(value: 3) @auth(policy: ADMIN_OR_USER_OWNER)
  }
`;

export const resolver: NonNullable<UserResolvers["todo"]> = async (parent, args, context) => {
  const ctx = context as ContextForAuthed;

  const id = unwrapOrElse(parseTodoId(args.id), (e) => {
    throw badUserInputError(e.message, e);
  });

  const todo = await ctx.queries.todo.loadTheir({
    id,
    userId: parent.id,
  });

  return todo ?? null;
};
