import type * as Prisma from "@/prisma/mod.ts";
import { type Full, type Key, isFull } from "../../common/resolvers.ts";

export type User = Key<Pick<Prisma.User, "id">> | Full<Prisma.User>;

export const fullUser = async (prisma: Prisma.PrismaClient, parent: User) => {
  return isFull(parent)
    ? parent
    : prisma.user.findUniqueOrThrow({
        where: { id: parent.id },
      });
};
