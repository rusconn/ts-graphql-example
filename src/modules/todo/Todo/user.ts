import type { TodoResolvers } from "../../../schema.ts";
import { forbiddenErr } from "../../common/resolvers.ts";
import { getUser } from "../../user/resolvers.ts";
import { authAdminOrTodoOwner } from "../authorizers.ts";

export const typeDef = /* GraphQL */ `
  extend type Todo {
    user: User
  }
`;

export const resolver: TodoResolvers["user"] = async (parent, _args, context) => {
  const authed = authAdminOrTodoOwner(context, parent);

  if (authed instanceof Error) {
    throw forbiddenErr(authed);
  }

  const user = await getUser(context, { id: parent.userId });

  return user ?? null;
};
