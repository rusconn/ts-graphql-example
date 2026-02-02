import type { TodoResolvers } from "../../schema.ts";
import { authAdminOrTodoOwner } from "../_authorizers/todo/adminOrTodoOwner.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { internalServerError } from "../_errors/internalServerError.ts";

export const typeDef = /* GraphQL */ `
  extend type Todo {
    user: User @semanticNonNull @complexity(value: 3)
  }
`;

export const resolver: NonNullable<TodoResolvers["user"]> = async (parent, _args, ctx) => {
  const authed = authAdminOrTodoOwner(ctx, parent);
  if (Error.isError(authed)) {
    throw forbiddenErr(authed);
  }

  const user = await ctx.queries.user.load(parent.userId);
  if (!user) {
    throw internalServerError();
  }

  return user;
};
