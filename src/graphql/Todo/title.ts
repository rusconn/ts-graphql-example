import type { TodoResolvers } from "../../schema.ts";
import { authTodoOwner } from "../_authorizers/todo/todoOwner.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";

export const typeDef = /* GraphQL */ `
  extend type Todo {
    title: String @semanticNonNull
  }
`;

export const resolver: NonNullable<TodoResolvers["title"]> = (parent, _args, context) => {
  const ctx = authTodoOwner(context, parent);
  if (Error.isError(ctx)) {
    throw forbiddenErr(ctx);
  }

  return parent.title;
};
