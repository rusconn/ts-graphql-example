import type { TodoResolvers } from "../../../schema.ts";
import { authAdminOrTodoOwner } from "../common/authorizer.ts";
import { getTodo } from "../common/resolver.ts";

export const typeDef = /* GraphQL */ `
  extend type Todo {
    updatedAt: DateTime
  }
`;

export const resolver: TodoResolvers["updatedAt"] = async (parent, _args, context) => {
  const todo = await getTodo(context, parent);

  authAdminOrTodoOwner(context, todo);

  return todo.updatedAt;
};
