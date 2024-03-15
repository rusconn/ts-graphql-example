import * as Prisma from "@/prisma/mod.ts";
import { type Context, notFoundErr } from "../../common/resolvers.ts";

export type User = Prisma.User;

export const getUser = async (context: Pick<Context, "prisma">, key: Pick<User, "id">) => {
  const user = await context.prisma.user.findUnique({
    where: { id: key.id },
  });

  if (!user) {
    throw notFoundErr();
  }

  return user;
};
