import type { TodoResolvers } from "../../../schema.ts";
import { forbiddenErr } from "../../common/errors/forbidden.ts";
import { todoStatus } from "../adapters/status.ts";
import { authTodoOwner } from "../authorizers/todoOwner.ts";

export const typeDef = /* GraphQL */ `
  extend type Todo {
    status: TodoStatus
  }

  enum TodoStatus {
    DONE
    PENDING
  }
`;

export const resolver: TodoResolvers["status"] = (parent, _args, context) => {
  const authed = authTodoOwner(context, parent);

  if (authed instanceof Error) {
    throw forbiddenErr(authed);
  }

  return todoStatus(parent.status);
};
