import type { TodoResolvers } from "../../../schema.ts";
import { authTodoOwner } from "../common/authorizer.ts";

export const typeDef = /* GraphQL */ `
  extend type Todo {
    description: String
  }
`;

export const resolver: TodoResolvers["description"] = (parent, _args, context) => {
  authTodoOwner(context, parent);

  return parent.description;
};
