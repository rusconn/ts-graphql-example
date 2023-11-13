import type { TodoResolvers } from "../common/schema.js";
import { todoNodeId } from "./common/adapter.js";
import { isAdminOrTodoOwner } from "./common/authorizer.js";
import { fullTodo } from "./common/fuller.js";

export const typeDef = /* GraphQL */ `
  extend type Todo {
    id: ID!
  }
`;

export const resolver: TodoResolvers["id"] = async (parent, _args, context) => {
  const todo = await fullTodo(context.prisma, parent);

  authorizer(context.user, todo);

  return adapter(todo.id);
};

export const authorizer = isAdminOrTodoOwner;

export const adapter = todoNodeId;
