import type { Logger } from "pino";

import type * as Prisma from "@/prisma";

export type Context = {
  prisma: Prisma.PrismaClient;
  user: Pick<Prisma.User, "id" | "role"> | { id: "GUEST"; role: "GUEST" };
  logger: Logger;
};
