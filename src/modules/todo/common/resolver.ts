import type { SetOptional } from "type-fest";

import * as Prisma from "@/prisma/mod.ts";
import { type Context, type Full, type Key, isFull, notFoundErr } from "../../common/resolvers.ts";

export type Todo =
  | Key<SetOptional<Pick<Prisma.Todo, "id" | "userId">, "userId">>
  | Full<Prisma.Todo>;

export const fullTodo = async (prisma: Context["prisma"], parent: Todo) => {
  if (isFull(parent)) {
    return parent;
  }

  const todo = await prisma.todo.findUnique({
    where: { id: parent.id, userId: parent.userId },
  });

  if (!todo) {
    throw notFoundErr();
  }

  return todo;
};
