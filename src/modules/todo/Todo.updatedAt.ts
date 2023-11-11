import type { TodoResolvers } from "../common/schema";
import { isAdminOrTodoOwner } from "./common/authorizer";
import { fullTodo } from "./common/fuller";

export const typeDef = /* GraphQL */ `
  extend type Todo {
    updatedAt: DateTime
  }
`;

export const resolver: TodoResolvers["updatedAt"] = async (parent, _args, context) => {
  const todo = await fullTodo(context.prisma, parent);

  authorizer(context.user, todo);

  return todo.updatedAt;
};

export const authorizer = isAdminOrTodoOwner;
