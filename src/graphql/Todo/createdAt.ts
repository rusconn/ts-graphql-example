import { authAdminOrTodoOwner } from "../_authorizers/todo/admin-or-owner.ts";
import { forbiddenErr } from "../_errors/global/forbidden.ts";
import type { TodoResolvers } from "../_schema.ts";

export const typeDef = /* GraphQL */ `
  extend type Todo {
    createdAt: DateTime @semanticNonNull
  }
`;

export const resolver: NonNullable<TodoResolvers["createdAt"]> = (parent, _args, context) => {
  const ctx = authAdminOrTodoOwner(context, parent);
  if (Error.isError(ctx)) {
    throw forbiddenErr(ctx);
  }

  return parent.createdAt;
};
