import type { TodoResolvers } from "../../../schema.ts";
import { dateByUlid } from "../../common/resolvers.ts";
import { authAdminOrTodoOwner } from "../common/authorizer.ts";
import { getTodo } from "../common/resolver.ts";

export const typeDef = /* GraphQL */ `
  extend type Todo {
    createdAt: DateTime
  }
`;

export const resolver: TodoResolvers["createdAt"] = async (parent, _args, context) => {
  const todo = await getTodo(context, parent);

  authAdminOrTodoOwner(context, todo);

  return dateByUlid(todo.id);
};
