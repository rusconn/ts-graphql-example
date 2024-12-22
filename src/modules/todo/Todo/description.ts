import type { TodoResolvers } from "../../../schema.ts";
import { forbiddenErr } from "../../common/resolvers.ts";
import { authTodoOwner } from "../authorizer.ts";

export const typeDef = /* GraphQL */ `
  extend type Todo {
    description: String
  }
`;

export const resolver: TodoResolvers["description"] = (parent, _args, context) => {
  const authed = authTodoOwner(context, parent);

  if (authed instanceof Error) {
    throw forbiddenErr(authed);
  }

  return parent.description;
};
