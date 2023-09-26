import type { Logger } from "pino";

import type * as DataSource from "@/datasources";

export type Context = {
  logger: Logger;
  user: Pick<DataSource.User, "id" | "role"> | { id: "GUEST"; role: "GUEST" };
  dataSources: {
    prisma: DataSource.PrismaClient;
  };
};
