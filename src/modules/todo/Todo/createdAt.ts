import type { TodoResolvers } from "../../../schema.ts";
import { forbiddenErr } from "../../common/errors/forbidden.ts";
import { authAdminOrTodoOwner } from "../authorizers/adminOrTodoOwner.ts";
import * as todoId from "../internal/id.ts";

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

  return todoId.date(parent.id);
};
