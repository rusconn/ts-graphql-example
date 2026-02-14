import { authAdminOrTodoOwner } from "../_authorizers/todo/admin-or-todo-owner.ts";
import { forbiddenErr } from "../_errors/global/forbidden.ts";
import type { TodoResolvers } from "../_schema.ts";
import { nodeId } from "../Node/id.ts";

export const typeDef = /* GraphQL */ `
  extend type Todo implements Node {
    id: ID!
  }
`;

export const resolver: NonNullable<TodoResolvers["id"]> = (parent, _args, context) => {
  const ctx = authAdminOrTodoOwner(context, parent);
  if (Error.isError(ctx)) {
    throw forbiddenErr(ctx);
  }

  return todoId(parent.id);
};

export const todoId = nodeId("Todo");
