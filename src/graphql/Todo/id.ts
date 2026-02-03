import type { TodoResolvers } from "../../schema.ts";
import { todoId } from "../_adapters/todo/id.ts";
import { authAdminOrTodoOwner } from "../_authorizers/todo/adminOrTodoOwner.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";

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
