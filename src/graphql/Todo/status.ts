import * as Db from "../../db/types.ts";
import type { TodoResolvers } from "../../schema.ts";
import * as Graph from "../../schema.ts";
import { authTodoOwner } from "../_authorizers/todo/todoOwner.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";

export const typeDef = /* GraphQL */ `
  extend type Todo {
    status: TodoStatus @semanticNonNull
  }

  enum TodoStatus {
    DONE
    PENDING
  }
`;

export const resolver: NonNullable<TodoResolvers["status"]> = (parent, _args, context) => {
  const ctx = authTodoOwner(context, parent);
  if (Error.isError(ctx)) {
    throw forbiddenErr(ctx);
  }

  return todoStatus(parent.status);
};

export const todoStatus = (status: Db.Todo["status"]): NonNullable<Graph.Todo["status"]> => {
  return map[status];
};

const map: Record<Db.TodoStatus, NonNullable<Graph.Todo["status"]>> = {
  [Db.TodoStatus.Done]: Graph.TodoStatus.Done,
  [Db.TodoStatus.Pending]: Graph.TodoStatus.Pending,
};
