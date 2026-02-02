import type { TodoResolvers } from "../../schema.ts";
import { authAdminOrTodoOwner } from "../_authorizers/todo/adminOrTodoOwner.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";

export const typeDef = /* GraphQL */ `
  extend type Todo {
    createdAt: DateTime @semanticNonNull
  }
`;

export const resolver: NonNullable<TodoResolvers["createdAt"]> = (parent, _args, ctx) => {
  const authed = authAdminOrTodoOwner(ctx, parent);
  if (Error.isError(authed)) {
    throw forbiddenErr(authed);
  }

  return parent.createdAt;
};
