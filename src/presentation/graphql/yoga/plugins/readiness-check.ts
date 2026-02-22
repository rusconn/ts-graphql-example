import { type Plugin, useReadinessCheck } from "graphql-yoga";
import { sql } from "kysely";

import { kysely } from "../../../../infrastructure/datasources/db/client.ts";

export const readinessCheck: Plugin = useReadinessCheck({
  check: async () => {
    type Status = 200 | 503;

    let db: Status = 200;
    try {
      await sql`select 1`.execute(kysely);
    } catch (err) {
      console.error(err);
      db = 503;
    }

    const statuses = { db };
    const status = Object.values(statuses).includes(503) ? 503 : 200;

    return status === 200 || new Response(JSON.stringify(statuses), { status });
  },
});
