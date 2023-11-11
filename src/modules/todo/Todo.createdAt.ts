import type { TodoResolvers } from "../common/schema";
import { isAdminOrTodoOwner } from "./common/authorizer";
import { fullTodo } from "./common/fuller";

export const typeDef = /* GraphQL */ `
  extend type Todo {
    createdAt: DateTime
  }
`;

export const resolver: TodoResolvers["createdAt"] = async (parent, _args, context) => {
  const todo = await fullTodo(context.prisma, parent);

  authorizer(context.user, todo);

  return todo.createdAt;
};

export const authorizer = isAdminOrTodoOwner;
