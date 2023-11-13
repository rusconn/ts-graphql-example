import type { TodoResolvers } from "../common/schema.js";
import { isTodoOwner } from "./common/authorizer.js";
import { fullTodo } from "./common/fuller.js";

export const typeDef = /* GraphQL */ `
  extend type Todo {
    title: NonEmptyString
  }
`;

export const resolver: TodoResolvers["title"] = async (parent, _args, context) => {
  const todo = await fullTodo(context.prisma, parent);

  authorizer(context.user, todo);

  return todo.title;
};

export const authorizer = isTodoOwner;
