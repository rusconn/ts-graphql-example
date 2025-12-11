import process from "node:process";

import { client } from "../src/db/client.ts";

import * as todos from "./seeds/todos.ts";
import * as userCredentials from "./seeds/user-credentials.ts";
import * as userTokens from "./seeds/user-tokens.ts";
import * as users from "./seeds/users.ts";

const seed = async () => {
  await client.transaction().execute(async (trx) => {
    const userIds = await users.seed(trx);
    await userCredentials.seed(trx, userIds);
    await userTokens.seed(trx, userIds);
    await todos.seed(trx, userIds);
  });
};

try {
  await seed();
} catch (e) {
  console.error(e);
  process.exitCode = 1;
} finally {
  await client.destroy();
}
