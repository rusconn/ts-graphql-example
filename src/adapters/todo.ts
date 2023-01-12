import * as Prisma from "@prisma/client";

import { Graph, Mapper } from "@/graphql/types";
import { nonEmptyString } from "@/graphql/utils";
import { splitSpecifiedNodeId, toSpecifiedNodeId } from "./node";
import { toGraphConnections } from "./utils";

export const toTodoNodeId = toSpecifiedNodeId("Todo");
export const splitTodoNodeId = splitSpecifiedNodeId("Todo");

export const toTodoNode = (todo: Prisma.Todo): Mapper.Todo => ({
  ...todo,
  id: toTodoNodeId(todo.id),
  title: nonEmptyString(todo.title),
  status: {
    [Prisma.TodoStatus.DONE]: Graph.TodoStatus.Done,
    [Prisma.TodoStatus.PENDING]: Graph.TodoStatus.Pending,
  }[todo.status],
});

export const toTodoNodes = toGraphConnections(toTodoNode);
