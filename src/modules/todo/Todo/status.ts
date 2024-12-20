import type { TodoResolvers } from "../../../schema.ts";
import { forbiddenErr } from "../../common/resolvers.ts";
import { todoStatus } from "../common/adapter.ts";
import { authTodoOwner } from "../common/authorizer.ts";

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
