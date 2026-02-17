import { authTodoOwner } from "../_authorizers/todo/owner.ts";
import { forbiddenErr } from "../_errors/global/forbidden.ts";
import type { TodoResolvers } from "../_schema.ts";

export const typeDef = /* GraphQL */ `
  extend type Todo {
    description: String @semanticNonNull
  }
`;

export const resolver: NonNullable<TodoResolvers["description"]> = (parent, _args, context) => {
  const ctx = authTodoOwner(context, parent);
  if (Error.isError(ctx)) {
    throw forbiddenErr(ctx);
  }

  return parent.description;
};
