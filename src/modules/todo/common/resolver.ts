import type { SetOptional, SetRequired } from "type-fest";

import * as Prisma from "@/prisma/mod.ts";
import {
  type Context,
  notFoundErr,
  selectColumns as selectColumnsCommon,
} from "../../common/resolvers.ts";
import type * as Graph from "../../common/schema.ts";

export type Todo = SetRequired<Partial<Prisma.Todo>, "id" | "userId">;

export const getTodo = async (
  context: Pick<Context, "prisma">,
  key: SetOptional<Pick<Todo, "id" | "userId">, "userId">,
  select?: ReturnType<typeof selectColumns>,
) => {
  const todo = await context.prisma.todo.findUnique({
    where: { id: key.id, userId: key.userId },
    select,
  });

  if (!todo) {
    throw notFoundErr();
  }

  return todo;
};

const fieldColumnMap: Partial<Record<keyof Graph.Todo, keyof Prisma.Todo>> = {
  title: "title",
  description: "description",
  status: "status",
};

const requiredColumns = ["id", "userId"] as const;

export const selectColumns = selectColumnsCommon<
  Graph.Todo,
  Prisma.Todo,
  (typeof requiredColumns)[number]
>(fieldColumnMap, requiredColumns);
