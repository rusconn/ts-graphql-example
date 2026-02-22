import { unwrapOrElse } from "../../../../lib/neverthrow-extra.ts";
import { authAdminOrUserOwner } from "../_authorizers/user/admin-or-owner.ts";
import { badUserInputError } from "../_errors/global/bad-user-input.ts";
import { forbiddenError } from "../_errors/global/forbidden.ts";
import { parseTodoId } from "../_parsers/todo/id.ts";
import type { UserResolvers } from "../_types.ts";

export const typeDef = /* GraphQL */ `
  extend type User {
    todo(id: ID!): Todo @complexity(value: 3)
  }
`;

export const resolver: NonNullable<UserResolvers["todo"]> = async (parent, args, context) => {
  const ctx = authAdminOrUserOwner(context, parent);
  if (Error.isError(ctx)) {
    throw forbiddenError(ctx);
  }

  const id = unwrapOrElse(parseTodoId(args.id), (e) => {
    throw badUserInputError(e.message, e);
  });

  const todo = await ctx.queries.todo.loadTheir({
    id,
    userId: parent.id,
  });

  return todo ?? null;
};
