import type { TodoResolvers } from "../../../schema.ts";
import { dateByUlid } from "../../common/resolvers.ts";
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
