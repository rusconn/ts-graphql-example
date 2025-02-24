import { Kysely, type LogEvent, PostgresDialect } from "kysely";
import pg, { type DatabaseError } from "pg";

import { connectionString } from "../config/db.ts";
import { isProd } from "../config/env.ts";
import { logger } from "../logger.ts";
import type { DB } from "./types.ts";

// PostgreSQL's string of int8(bigint, bigserial) -> js number(possible loss of precision)
pg.types.setTypeParser(pg.types.builtins.INT8, Number);

const [logQuery, logError] = isProd
  ? [
      (obj: Record<string, unknown>) => logger.info(obj, "query-info"),
      (obj: Record<string, unknown>) => logger.error(obj, "query-error"),
    ]
  : [
      (obj: Record<string, unknown>) => console.log("kysely:query", obj),
      (obj: Record<string, unknown>) => console.error("kysely:error", obj),
    ];

/** Node.js 環境下ではモジュールキャッシュにより singleton */
export const client = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool: new pg.Pool({
      connectionString,
    }),
  }),
  log(event) {
    switch (event.level) {
      case "query":
        logQuery(common(event));
        break;
      case "error": {
        const e = event.error as DatabaseError;
        logError({
          message: e.message,
          stack: e.stack,
          table: e.table,
          code: e.code,
          constraint: e.constraint,
          ...common(event),
        });
        break;
      }
      default:
        throw new Error(event satisfies never);
    }
  },
});

const common = (event: LogEvent) => ({
  sql: event.query.sql,
  params: isProd ? "***" : event.query.parameters,
  duration: `${Math.round(event.queryDurationMillis)}ms`,
});
