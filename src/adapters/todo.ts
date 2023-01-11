import * as Prisma from "@prisma/client";

import { Graph, Mapper } from "@/graphql/types";
import { nonEmptyString } from "@/graphql/utils";
import { toGraphConnections } from "./utils";

export const toTodoNode = (todo: Prisma.Todo): Mapper.Todo => ({
  ...todo,
  title: nonEmptyString(todo.title),
  status: {
    [Prisma.TodoStatus.DONE]: Graph.TodoStatus.Done,
    [Prisma.TodoStatus.PENDING]: Graph.TodoStatus.Pending,
  }[todo.status],
});

export const toTodoNodes = toGraphConnections(toTodoNode);
