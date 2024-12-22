import type { TodoResolvers } from "../../../schema.ts";
import { forbiddenErr } from "../../common/resolvers.ts";
import { authAdminOrTodoOwner } from "../authorizers.ts";

export const typeDef = /* GraphQL */ `
  extend type Todo {
    updatedAt: DateTime
  }
`;

export const resolver: TodoResolvers["updatedAt"] = (parent, _args, context) => {
  const authed = authAdminOrTodoOwner(context, parent);

  if (authed instanceof Error) {
    throw forbiddenErr(authed);
  }

  return parent.updatedAt;
};
