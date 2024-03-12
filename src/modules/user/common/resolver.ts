import * as Prisma from "@/prisma/mod.ts";
import { type Context, notFoundErr } from "../../common/resolvers.ts";

export type User = Pick<Prisma.User, "id">;

export const getUser = async (prisma: Context["prisma"], parent: User) => {
  const user = await prisma.user.findUnique({
    where: { id: parent.id },
  });

  if (!user) {
    throw notFoundErr();
  }

  return user;
};
