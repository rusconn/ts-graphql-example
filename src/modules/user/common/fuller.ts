import type * as Prisma from "@/prisma/mod.js";
import { isFull } from "../../common/resolvers.js";
import type { ResolversParentTypes } from "../../common/schema.js";

type ParentUser = ResolversParentTypes["User"];

export const fullUser = async (prisma: Prisma.PrismaClient, parent: ParentUser) => {
  return isFull(parent)
    ? parent
    : prisma.user.findUniqueOrThrow({
        where: { id: parent.id },
      });
};
