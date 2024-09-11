import type { TodoResolvers } from "../../../schema.ts";
import { todoStatus } from "../common/adapter.ts";
import { authTodoOwner } from "../common/authorizer.ts";
import { getTodo } from "../common/resolver.ts";

export const typeDef = /* GraphQL */ `
  extend type Todo {
    status: TodoStatus
  }

  enum TodoStatus {
    DONE
    PENDING
  }
`;

export const resolver: TodoResolvers["status"] = async (parent, _args, context) => {
  const todo = await getTodo(context, parent);

  authTodoOwner(context, todo);

  return todoStatus(todo.status);
};
