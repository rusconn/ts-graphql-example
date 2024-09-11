import type { TodoResolvers } from "../../../schema.ts";
import { authTodoOwner } from "../common/authorizer.ts";
import { getTodo } from "../common/resolver.ts";

export const typeDef = /* GraphQL */ `
  extend type Todo {
    description: String
  }
`;

export const resolver: TodoResolvers["description"] = async (parent, _args, context) => {
  const todo = await getTodo(context, parent);

  authTodoOwner(context, todo);

  return todo.description;
};
