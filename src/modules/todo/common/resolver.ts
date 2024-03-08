import * as Prisma from "@/prisma/mod.ts";
import { type Full, type Key, isFull, notFoundErr } from "../../common/resolvers.ts";

export type Todo =
  | Key<Pick<Prisma.Todo, "id"> & Partial<Pick<Prisma.Todo, "userId">>>
  | Full<Prisma.Todo>;

export const fullTodo = async (prisma: Prisma.PrismaClient, parent: Todo) => {
  if (isFull(parent)) {
    return parent;
  }

  try {
    return await prisma.todo.findUniqueOrThrow({
      where: { id: parent.id, userId: parent.userId },
    });
  } catch (e) {
    if (e instanceof Prisma.NotExistsError) {
      throw notFoundErr();
    }

    throw e;
  }
};
