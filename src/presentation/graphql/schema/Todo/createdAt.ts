import { authAdminOrTodoOwner } from "../_authorizers/todo/admin-or-owner.ts";
import { forbiddenError } from "../_errors/global/forbidden.ts";
import type { TodoResolvers } from "../_types.ts";

export const typeDef = /* GraphQL */ `
  extend type Todo {
    createdAt: DateTimeISO @semanticNonNull
  }
`;

export const resolver: NonNullable<TodoResolvers["createdAt"]> = (parent, _args, context) => {
  const ctx = authAdminOrTodoOwner(context, parent);
  if (Error.isError(ctx)) {
    throw forbiddenError(ctx);
  }

  return parent.createdAt;
};
