import { PrismaClient } from "@prisma/client";

import { isProd } from "@/config.ts";

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
  console.log("prisma:query", {
    Query: `${e.query.replaceAll('"public".', "")}`,
    Params: isProd ? "***" : e.params,
    Duration: `${e.duration}ms`,
  });
});
