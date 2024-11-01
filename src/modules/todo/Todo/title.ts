import type { TodoResolvers } from "../../../schema.ts";
import { authTodoOwner } from "../common/authorizer.ts";

export const typeDef = /* GraphQL */ `
  extend type Todo {
    title: NonEmptyString
  }
`;

export const resolver: TodoResolvers["title"] = (parent, _args, context) => {
  authTodoOwner(context, parent);

  return parent.title;
};
