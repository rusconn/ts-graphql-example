import type * as Prisma from "@/prisma/mod.js";
import { type Key, type Full, isFull } from "../../common/resolvers.js";

export type User = Key<Pick<Prisma.User, "id">> | Full<Prisma.User>;

export const fullUser = async (prisma: Prisma.PrismaClient, parent: User) => {
  return isFull(parent)
    ? parent
    : prisma.user.findUniqueOrThrow({
        where: { id: parent.id },
      });
};
