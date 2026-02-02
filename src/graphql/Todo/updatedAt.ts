import type { TodoResolvers } from "../../schema.ts";
import { authAdminOrTodoOwner } from "../_authorizers/todo/adminOrTodoOwner.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";

export const typeDef = /* GraphQL */ `
  extend type Todo {
    updatedAt: DateTime @semanticNonNull
  }
`;

export const resolver: NonNullable<TodoResolvers["updatedAt"]> = (parent, _args, ctx) => {
  const authed = authAdminOrTodoOwner(ctx, parent);
  if (Error.isError(authed)) {
    throw forbiddenErr(authed);
  }

  return parent.updatedAt;
};
