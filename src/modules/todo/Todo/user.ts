import type { TodoResolvers } from "../../../schema.ts";
import { getUser } from "../../user/common/resolver.ts";
import { authAdminOrTodoOwner } from "../common/authorizer.ts";

export const typeDef = /* GraphQL */ `
  extend type Todo {
    user: User
  }
`;

export const resolver: TodoResolvers["user"] = async (parent, _args, context) => {
  authAdminOrTodoOwner(context, parent);

  return await getUser(context, { id: parent.userId });
};
