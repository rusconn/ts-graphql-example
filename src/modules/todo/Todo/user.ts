import type { TodoResolvers } from "../../../schema.ts";
import { getUser } from "../../user/common/resolver.ts";
import { authAdminOrTodoOwner } from "../common/authorizer.ts";
import { getTodo } from "../common/resolver.ts";

export const typeDef = /* GraphQL */ `
  extend type Todo {
    user: User
  }
`;

export const resolver: TodoResolvers["user"] = async (parent, _args, context) => {
  const todo = await getTodo(context, parent);

  authAdminOrTodoOwner(context, todo);

  // existence check
  await getUser(context, { id: todo.userId });

  return { id: todo.userId };
};
