import type { TodoResolvers } from "../../common/schema.ts";
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
  authTodoOwner(context, parent);

  return todoStatus(parent.status);
};
