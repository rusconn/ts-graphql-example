import { Prisma, PrismaClient } from "@prisma/client";

import { isProd } from "@/config";
import * as DataSource from "@/datasources";

const basePrisma = new PrismaClient({
  log: [
    { level: "query", emit: "event" },
    { level: "info", emit: "stdout" },
    { level: "warn", emit: "stdout" },
    { level: "error", emit: "stdout" },
  ],
});

const blue = (s: string) => `\x1b[34m${s}\u001b[0m` as const;

basePrisma.$on("query", e => {
  console.log(blue("prisma:query"), {
    Query: `${e.query.replaceAll('"public".', "")}`,
    Params: isProd ? "***" : e.params,
    Duration: `${e.duration}ms`,
  });
});

/** Node.js 環境下ではモジュールキャッシュにより singleton */
export const prisma = basePrisma.$extends({
  query: {
    async $allOperations({ args, query }) {
      try {
        return (await query(args)) as unknown;
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
    },
  },
}) as PrismaClient; // インターフェースは変えないので PrismaClient とした
