import process from "node:process";

import { kysely } from "../src/infra/datasources/db/client.ts";

import * as credentials from "./seeds/credentials.ts";
import * as refreshTokens from "./seeds/refresh-tokens.ts";
import * as todos from "./seeds/todos.ts";
import * as users from "./seeds/users.ts";

const seed = async () => {
  await kysely.transaction().execute(async (trx) => {
    const userIds = await users.seed(trx);
    await credentials.seed(trx, userIds);
    await refreshTokens.seed(trx, userIds);
    await todos.seed(trx, userIds);
  });
};

try {
  await seed();
} catch (e) {
  console.error(e);
  process.exitCode = 1;
} finally {
  await kysely.destroy();
}
