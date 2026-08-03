import type { Transaction } from "kysely";

import type { DB } from "../src/infrastructure/datasources/db/types.ts";
import { seed } from "./seed.ts";
import * as credentials from "./seeds/credentials.ts";
import * as refreshTokens from "./seeds/refresh-tokens.ts";
import * as todos from "./seeds/todos.ts";
import * as users from "./seeds/users.ts";

await seed(async (trx: Transaction<DB>) => {
  const userIds = await users.seedBulk(trx, 10_000);
  await credentials.seedBulk(trx, userIds);
  await refreshTokens.seedBulk(trx, userIds);
  await todos.seedBulk(trx, userIds);
});
