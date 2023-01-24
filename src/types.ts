import type { PrismaClient, User } from "@prisma/client";
import type { Logger } from "pino";

export type Context = {
  logger: Logger;
  user: User | { id: "GUEST"; role: "GUEST" };
  dataSources: {
    prisma: PrismaClient;
  };
};
