import type { SetOptional } from "type-fest";

import * as Prisma from "@/prisma/mod.ts";
import { type Context, notFoundErr } from "../../common/resolvers.ts";

export type Todo = SetOptional<Pick<Prisma.Todo, "id" | "userId">, "userId">;

export const getTodo = async (prisma: Context["prisma"], parent: Todo) => {
  const todo = await prisma.todo.findUnique({
    where: { id: parent.id, userId: parent.userId },
  });

  if (!todo) {
    throw notFoundErr();
  }

  return todo;
};
