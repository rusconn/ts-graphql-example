import * as Prisma from "@/prisma/mod.js";
import { TodoResolvers, TodoStatus } from "../common/schema.js";
import { isTodoOwner } from "./common/authorizer.js";
import { fullTodo } from "./common/fuller.js";

export const typeDef = /* GraphQL */ `
  extend type Todo {
    status: TodoStatus
  }

  enum TodoStatus {
    DONE
    PENDING
  }
`;

export const resolver: TodoResolvers["status"] = async (parent, _args, context) => {
  const todo = await fullTodo(context.prisma, parent);

  authorizer(context.user, todo);

  return adapter(todo.status);
};

export const authorizer = isTodoOwner;

export const adapter = (status: Prisma.Todo["status"]) => {
  return {
    [Prisma.TodoStatus.DONE]: TodoStatus.Done,
    [Prisma.TodoStatus.PENDING]: TodoStatus.Pending,
  }[status];
};
