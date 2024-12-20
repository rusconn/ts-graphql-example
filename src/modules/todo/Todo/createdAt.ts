import type { TodoResolvers } from "../../../schema.ts";
import { dateByUuid, forbiddenErr } from "../../common/resolvers.ts";
import { authAdminOrTodoOwner } from "../common/authorizer.ts";

export const typeDef = /* GraphQL */ `
  extend type Todo {
    createdAt: DateTime
  }
`;

export const resolver: TodoResolvers["createdAt"] = (parent, _args, context) => {
  const authed = authAdminOrTodoOwner(context, parent);

  if (authed instanceof Error) {
    throw forbiddenErr(authed);
  }

  return dateByUuid(parent.id);
};
