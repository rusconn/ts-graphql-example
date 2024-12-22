import type { TodoResolvers } from "../../../schema.ts";
import { forbiddenErr } from "../../common/errors/forbidden.ts";
import { authTodoOwner } from "../authorizers/todoOwner.ts";

export const typeDef = /* GraphQL */ `
  extend type Todo {
    title: NonEmptyString
  }
`;

export const resolver: TodoResolvers["title"] = (parent, _args, context) => {
  const authed = authTodoOwner(context, parent);

  if (authed instanceof Error) {
    throw forbiddenErr(authed);
  }

  return parent.title;
};
