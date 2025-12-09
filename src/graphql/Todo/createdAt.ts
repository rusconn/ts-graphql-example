import { TodoId } from "../../models/todo.ts";
import type { TodoResolvers } from "../../schema.ts";
import { authAdminOrTodoOwner } from "../_authorizers/todo/adminOrTodoOwner.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";

export const typeDef = /* GraphQL */ `
  extend type Todo {
    createdAt: DateTime @semanticNonNull
  }
`;

export const resolver: NonNullable<TodoResolvers["createdAt"]> = (parent, _args, context) => {
  const authed = authAdminOrTodoOwner(context, parent);

  if (authed instanceof Error) {
    throw forbiddenErr(authed);
  }

  return TodoId.date(parent.id);
};
