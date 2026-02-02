import type { TodoResolvers } from "../../schema.ts";
import { authTodoOwner } from "../_authorizers/todo/todoOwner.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";

export const typeDef = /* GraphQL */ `
  extend type Todo {
    description: String @semanticNonNull
  }
`;

export const resolver: NonNullable<TodoResolvers["description"]> = (parent, _args, context) => {
  const authed = authTodoOwner(context, parent);
  if (Error.isError(authed)) {
    throw forbiddenErr(authed);
  }

  return parent.description;
};
