import type { TodoResolvers } from "../../../schema.ts";
import { todoNodeId } from "../common/adapter.ts";
import { authAdminOrTodoOwner } from "../common/authorizer.ts";

export const typeDef = /* GraphQL */ `
  extend type Todo implements Node {
    id: ID!
  }
`;

export const resolver: TodoResolvers["id"] = (parent, _args, context) => {
  authAdminOrTodoOwner(context, parent);

  return todoNodeId(parent.id);
};
