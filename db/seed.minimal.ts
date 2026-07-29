import type { Transaction } from "kysely";

import type { DB } from "../src/infrastructure/datasources/_shared/types.ts";
import { seed } from "./seed.ts";
import * as credentials from "./seeds/credentials.ts";
import * as refreshTokens from "./seeds/refresh-tokens.ts";
import * as todos from "./seeds/todos.ts";
import * as users from "./seeds/users.ts";

await seed(async (trx: Transaction<DB>) => {
  await users.seedMinimal(trx);
  await credentials.seedMinimal(trx);
  await refreshTokens.seedMinimal(trx);
  await todos.seedMinimal(trx);
});
