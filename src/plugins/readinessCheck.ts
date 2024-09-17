import { type Plugin, useReadinessCheck } from "graphql-yoga";
import { sql } from "kysely";

import { db as client } from "@/db/client.ts";

export const readinessCheck: Plugin = useReadinessCheck({
  check: async () => {
    type Status = 200 | 503;

    let db: Status = 200;
    try {
      await sql`select 1`.execute(client);
    } catch (err) {
      console.error(err);
      db = 503;
    }

    const statuses = { db };
    const status = Object.values(statuses).includes(503) ? 503 : 200;

    return status === 200 //
      ? true
      : new Response(JSON.stringify(statuses), { status });
  },
});
