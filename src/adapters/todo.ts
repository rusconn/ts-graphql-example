import * as Prisma from "@prisma/client";

import { TodoStatus } from "@/types";
import type * as Mapper from "@/types/mappers";
import { nonEmptyString } from "@/utils";
import { toSchemaConnections } from "./utils";

export const toSchemaTodo = (todo: Prisma.Todo): Mapper.Todo => ({
  ...todo,
  title: nonEmptyString(todo.title),
  status: {
    [Prisma.TodoStatus.DONE]: TodoStatus.Done,
    [Prisma.TodoStatus.PENDING]: TodoStatus.Pending,
  }[todo.status],
});

export const toSchemaTodos = toSchemaConnections(toSchemaTodo);
