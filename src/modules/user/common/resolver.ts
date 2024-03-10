import * as Prisma from "@/prisma/mod.ts";
import { type Context, type Full, type Key, isFull, notFoundErr } from "../../common/resolvers.ts";

export type User = Key<Pick<Prisma.User, "id">> | Full<Prisma.User>;

export const fullUser = async (prisma: Context["prisma"], parent: User) => {
  if (isFull(parent)) {
    return parent;
  }

  const user = await prisma.user.findUnique({
    where: { id: parent.id },
  });

  if (!user) {
    throw notFoundErr();
  }

  return user;
};
