import { dateByUlid } from "../../common/resolvers.ts";
import type { TodoResolvers } from "../../common/schema.ts";
import { authAdminOrTodoOwner } from "../common/authorizer.ts";

export const typeDef = /* GraphQL */ `
  extend type Todo {
    createdAt: DateTime
  }
`;

export const resolver: TodoResolvers["createdAt"] = (parent, _args, context) => {
  authAdminOrTodoOwner(context, parent);

  return dateByUlid(parent.id);
};
