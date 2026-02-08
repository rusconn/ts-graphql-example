import type { TodoResolvers } from "../_schema.ts";
import { authAdminOrTodoOwner } from "../_authorizers/todo/adminOrTodoOwner.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";

export const typeDef = /* GraphQL */ `
  extend type Todo {
    updatedAt: DateTime @semanticNonNull
  }
`;

export const resolver: NonNullable<TodoResolvers["updatedAt"]> = (parent, _args, context) => {
  const ctx = authAdminOrTodoOwner(context, parent);
  if (Error.isError(ctx)) {
    throw forbiddenErr(ctx);
  }

  return parent.updatedAt;
};
