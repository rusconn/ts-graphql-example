import { PrismaClient } from "@prisma/client";

import { isProd } from "@/config.ts";
import { logger } from "@/logger";

/** Node.js 環境下ではモジュールキャッシュにより singleton */
export const prisma = new PrismaClient({
  log: [
    { level: "query", emit: "event" },
    { level: "info", emit: "stdout" },
    { level: "warn", emit: "stdout" },
    { level: "error", emit: "stdout" },
  ],
});

const log = isProd
  ? (obj: object) => {
      logger.info(obj, "query-info");
    }
  : (obj: object) => {
      console.log("prisma:query", obj);
    };

prisma.$on("query", e =>
  log({
    Query: e.query.replaceAll('"public".', ""),
    Params: isProd ? "***" : e.params,
    Duration: `${e.duration}ms`,
  }),
);
