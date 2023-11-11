import type * as Prisma from "@/prisma";
import { isFull } from "../../common/resolvers";
import type { ResolversParentTypes } from "../../common/schema";

type ParentUser = ResolversParentTypes["User"];

export const fullUser = async (prisma: Prisma.PrismaClient, parent: ParentUser) => {
  return isFull(parent)
    ? parent
    : prisma.user.findUniqueOrThrow({
        where: { id: parent.id },
      });
};
