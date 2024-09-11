import type { TodoResolvers } from "../../../schema.ts";
import { todoNodeId } from "../common/adapter.ts";
import { authAdminOrTodoOwner } from "../common/authorizer.ts";
import { getTodo } from "../common/resolver.ts";

export const typeDef = /* GraphQL */ `
  extend type Todo implements Node {
    id: ID!
  }
`;

export const resolver: TodoResolvers["id"] = async (parent, _args, context) => {
  const todo = await getTodo(context, parent);

  authAdminOrTodoOwner(context, todo);

  return todoNodeId(todo.id);
};
