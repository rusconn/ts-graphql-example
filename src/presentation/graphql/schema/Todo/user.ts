import { authAdminOrTodoOwner } from "../_authorizers/todo/admin-or-owner.ts";
import { forbiddenError } from "../_errors/global/forbidden.ts";
import { internalServerError } from "../_errors/global/internal-server-error.ts";
import type { TodoResolvers } from "../_types.ts";

export const typeDef = /* GraphQL */ `
  extend type Todo {
    user: User @semanticNonNull @complexity(value: 3)
  }
`;

export const resolver: NonNullable<TodoResolvers["user"]> = async (parent, _args, context) => {
  const ctx = authAdminOrTodoOwner(context, parent);
  if (Error.isError(ctx)) {
    throw forbiddenError(ctx);
  }

  const user = await ctx.queries.user.load(parent.userId);
  if (!user) {
    throw internalServerError();
  }

  return user;
};
