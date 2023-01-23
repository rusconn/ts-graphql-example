import { Prisma, PrismaClient } from "@prisma/client";

import { isProd } from "@/config";
import * as DataSource from "@/datasources";

/** Node.js 環境下ではモジュールキャッシュにより singleton */
export const prisma = new PrismaClient({
  log: [
    { level: "query", emit: "event" },
    { level: "info", emit: "stdout" },
    { level: "warn", emit: "stdout" },
    { level: "error", emit: "stdout" },
  ],
});

prisma.$on("query", e => {
  console.log("\x1b[34mprisma:query\u001b[0m", {
    Query: `${e.query.replaceAll('"public".', "")}`,
    Params: isProd ? "***" : e.params,
    Duration: `${e.duration}ms`,
  });
});

prisma.$use(async (params, next) => {
  try {
    return (await next(params)) as unknown;
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      switch (e.code) {
        case "P2000":
          throw new DataSource.InputTooLongError(e);
        case "P2001":
        case "P2025":
          throw new DataSource.NotFoundError(e);
        case "P2002":
          throw new DataSource.NotUniqueError(e);
        default:
          throw new DataSource.DataSourceError(e);
      }
    }

    throw e;
  }
});
