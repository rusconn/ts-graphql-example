import { mappers } from "../../mappers.ts";
import type { TodoResolvers } from "../../schema.ts";
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
  const authed = authTodoOwner(context, parent);
  if (Error.isError(authed)) {
    throw forbiddenErr(authed);
  }

  return mappers.todo.status.toDomain(parent.status);
};
