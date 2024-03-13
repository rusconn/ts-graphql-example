import type { SetOptional } from "type-fest";

import * as Prisma from "@/prisma/mod.ts";
import { type Context, notFoundErr } from "../../common/resolvers.ts";

export type Todo = Prisma.Todo;

export const getTodo = async (
  prisma: Context["prisma"],
  key: SetOptional<Pick<Todo, "id" | "userId">, "userId">,
) => {
  const todo = await prisma.todo.findUnique({
    where: { id: key.id, userId: key.userId },
  });

  if (!todo) {
    throw notFoundErr();
  }

  return todo;
};
