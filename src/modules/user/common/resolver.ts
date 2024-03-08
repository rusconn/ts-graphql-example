import * as Prisma from "@/prisma/mod.ts";
import { type Full, type Key, isFull, notFoundErr } from "../../common/resolvers.ts";

export type User = Key<Pick<Prisma.User, "id">> | Full<Prisma.User>;

export const fullUser = async (prisma: Prisma.PrismaClient, parent: User) => {
  if (isFull(parent)) {
    return parent;
  }

  try {
    return await prisma.user.findUniqueOrThrow({
      where: { id: parent.id },
    });
  } catch (e) {
    if (e instanceof Prisma.NotExistsError) {
      throw notFoundErr();
    }

    throw e;
  }
};
