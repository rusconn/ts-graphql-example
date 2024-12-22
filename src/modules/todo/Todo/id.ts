import type { TodoResolvers } from "../../../schema.ts";
import { forbiddenErr } from "../../common/errors/forbidden.ts";
import { todoId } from "../adapters/id.ts";
import { authAdminOrTodoOwner } from "../authorizers/adminOrTodoOwner.ts";

export const typeDef = /* GraphQL */ `
  extend type Todo implements Node {
    id: ID!
  }
`;

export const resolver: TodoResolvers["id"] = (parent, _args, context) => {
  const authed = authAdminOrTodoOwner(context, parent);

  if (authed instanceof Error) {
    throw forbiddenErr(authed);
  }

  return todoId(parent.id);
};
