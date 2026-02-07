import type { TodoResolvers } from "../../schema.ts";
import { todoStatus } from "../_adapters/todo/status.ts";
import { authTodoOwner } from "../_authorizers/todo/todoOwner.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";

export const typeDef = /* GraphQL */ `
  extend type Todo {
    status: TodoStatus @semanticNonNull
  }

  enum TodoStatus {
    DONE
    PENDING
  }
`;

export const resolver: NonNullable<TodoResolvers["status"]> = (parent, _args, context) => {
  const ctx = authTodoOwner(context, parent);
  if (Error.isError(ctx)) {
    throw forbiddenErr(ctx);
  }

  return todoStatus(parent.status);
};
