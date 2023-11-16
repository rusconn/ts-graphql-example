import type * as Prisma from "@/prisma/mod.js";
import { type Key, type Full, isFull } from "../../common/resolvers.js";

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
