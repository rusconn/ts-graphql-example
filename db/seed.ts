import process from "node:process";

import type { Transaction } from "kysely";

import type { DB } from "../src/infrastructure/datasources/_shared/types.ts";
import { kysely } from "../src/infrastructure/datasources/db/client.ts";

export async function seed(seedFn: (trx: Transaction<DB>) => Promise<void>) {
  try {
    await kysely.transaction().execute(seedFn);
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  } finally {
    await kysely.destroy();
  }
}
