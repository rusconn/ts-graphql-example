import type { Logger } from "pino";
import type { YogaInitialContext } from "graphql-yoga";

import type * as Prisma from "@/prisma";

export type Context = YogaInitialContext & ServerContext & UserContext;

export type ServerContext = Record<string, never>;

export type UserContext = {
  prisma: Prisma.PrismaClient;
  user: ContextUser;
  logger: Logger;
};

export type ContextUser = Admin | User | Guest;

export type Admin = Pick<Prisma.User, "id"> & { role: "ADMIN" };
export type User = Pick<Prisma.User, "id"> & { role: "USER" };
export type Guest = { id: "GUEST"; role: "GUEST" };
