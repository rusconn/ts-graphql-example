import type { PrismaClient, User } from "@prisma/client";
import type { Logger } from "pino";

export type Context = {
  logger: Logger;
  user: Pick<User, "id" | "role"> | { id: "GUEST"; role: "GUEST" };
  dataSources: {
    prisma: PrismaClient;
  };
};
