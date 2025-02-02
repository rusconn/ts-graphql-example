import { type ErrorLogEvent, Kysely, PostgresDialect } from "kysely";
import pg from "pg";

import { connectionString, isProd } from "../config.ts";
import { logger } from "../logger.ts";
import type { DB } from "./generated/types.ts";

// PostgreSQL's string of int8(bigint, bigserial) -> js number(possible loss of precision)
pg.types.setTypeParser(pg.types.builtins.INT8, Number);

const [logQuery, logError] = isProd
  ? [
      (obj: object) => logger.info(obj, "query-info"),
      (event: ErrorLogEvent) => logger.error(event, "query-error"),
    ]
  : [
      (obj: object) => console.log("kysely:query", obj),
      (event: ErrorLogEvent) => console.error("%o", event),
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
        logQuery({
          sql: event.query.sql,
          params: isProd ? "***" : event.query.parameters,
          duration: `${Math.round(event.queryDurationMillis)}ms`,
        });
        break;
      case "error":
        logError(event);
        break;
    }
  },
});
