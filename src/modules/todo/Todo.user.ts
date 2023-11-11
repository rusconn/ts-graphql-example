import type { TodoResolvers } from "../common/schema";
import { isAdminOrTodoOwner } from "./common/authorizer";
import { fullTodo } from "./common/fuller";

export const typeDef = /* GraphQL */ `
  extend type Todo {
    user: User
  }
`;

export const resolver: TodoResolvers["user"] = async (parent, _args, context) => {
  const todo = await fullTodo(context.prisma, parent);

  authorizer(context.user, todo);

  return { id: todo.userId };
};

export const authorizer = isAdminOrTodoOwner;
