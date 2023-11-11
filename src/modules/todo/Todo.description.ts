import type { TodoResolvers } from "../common/schema";
import { isTodoOwner } from "./common/authorizer";
import { fullTodo } from "./common/fuller";

export const typeDef = /* GraphQL */ `
  extend type Todo {
    description: String
  }
`;

export const resolver: TodoResolvers["description"] = async (parent, _args, context) => {
  const todo = await fullTodo(context.prisma, parent);

  authorizer(context.user, todo);

  return todo.description;
};

export const authorizer = isTodoOwner;
