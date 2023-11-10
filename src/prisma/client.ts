import { Prisma, PrismaClient } from "@prisma/client";

import { isProd } from "@/config";
import { blue } from "@/generic/console";
import * as Errors from "./errors";

const basePrisma = new PrismaClient({
  log: [
    { level: "query", emit: "event" },
    { level: "info", emit: "stdout" },
    { level: "warn", emit: "stdout" },
    { level: "error", emit: "stdout" },
  ],
});

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
              throw new Errors.InputTooLongError(e.message, { cause: e });
            case "P2001":
            case "P2025":
              throw new Errors.NotExistsError(e.message, { cause: e });
            case "P2002":
              throw new Errors.NotUniqueError(e.message, { cause: e });
            default:
              throw new Errors.PrismaError(e.message, { cause: e });
          }
        }

        throw e;
      }
    },
  },
}) as PrismaClient; // インターフェースは変えないので PrismaClient とした
