import { unwrapOrElse } from "../../util/neverthrow.ts";
import { authAdminOrUserOwner } from "../_authorizers/user/admin-or-user-owner.ts";
import { badUserInputErr } from "../_errors/global/bad-user-input.ts";
import { forbiddenErr } from "../_errors/global/forbidden.ts";
import { parseTodoId } from "../_parsers/todo/id.ts";
import type { UserResolvers } from "../_schema.ts";

export const typeDef = /* GraphQL */ `
  extend type User {
    todo(id: ID!): Todo @complexity(value: 3)
  }
`;

export const resolver: NonNullable<UserResolvers["todo"]> = async (parent, args, context) => {
  const ctx = authAdminOrUserOwner(context, parent);
  if (Error.isError(ctx)) {
    throw forbiddenErr(ctx);
  }

  const id = unwrapOrElse(parseTodoId(args.id), (e) => {
    throw badUserInputErr(e.message, e);
  });

  const todo = await ctx.queries.todo.loadTheir({
    id,
    userId: parent.id,
  });

  return todo ?? null;
};
