import type { Logger } from "pino";
import type { YogaInitialContext } from "graphql-yoga";

import type * as Prisma from "@/prisma";

export type Context = YogaInitialContext & ServerContext & UserContext;

export type ServerContext = Record<string, never>;

export type UserContext = {
  prisma: Prisma.PrismaClient;
  user: Pick<Prisma.User, "id" | "role"> | { id: "GUEST"; role: "GUEST" };
  logger: Logger;
};
