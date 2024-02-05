import type * as Prisma from "@/prisma/mod.ts";
import { type Full, type Key, isFull } from "../../common/resolvers.ts";

export type Todo =
  | Key<Pick<Prisma.Todo, "id"> & Partial<Pick<Prisma.Todo, "userId">>>
  | Full<Prisma.Todo>;

export const fullTodo = async (prisma: Prisma.PrismaClient, parent: Todo) => {
  return isFull(parent)
    ? parent
    : prisma.todo.findUniqueOrThrow({
        where: { id: parent.id, userId: parent.userId },
      });
};
