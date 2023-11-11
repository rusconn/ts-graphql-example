import type * as Prisma from "@/prisma";
import { isFull } from "../../common/resolvers";
import type { ResolversParentTypes } from "../../common/schema";

type ParentTodo = ResolversParentTypes["Todo"];

export const fullTodo = async (prisma: Prisma.PrismaClient, parent: ParentTodo) => {
  return isFull(parent)
    ? parent
    : prisma.todo.findUniqueOrThrow({
        where: { id: parent.id, userId: parent.userId },
      });
};
