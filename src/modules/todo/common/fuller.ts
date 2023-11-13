import type * as Prisma from "@/prisma/mod.js";
import { isFull } from "../../common/resolvers.js";
import type { ResolversParentTypes } from "../../common/schema.js";

type ParentTodo = ResolversParentTypes["Todo"];

export const fullTodo = async (prisma: Prisma.PrismaClient, parent: ParentTodo) => {
  return isFull(parent)
    ? parent
    : prisma.todo.findUniqueOrThrow({
        where: { id: parent.id, userId: parent.userId },
      });
};
