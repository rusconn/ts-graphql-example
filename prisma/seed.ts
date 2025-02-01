import process from "node:process";

import { client } from "../src/db/client.ts";
import * as todo from "./seeds/todo.ts";
import * as userCredential from "./seeds/user-credential.ts";
import * as userToken from "./seeds/user-token.ts";
import * as user from "./seeds/user.ts";

const seed = async () => {
  await client.transaction().execute(async (trx) => {
    const userIds = await user.seed(trx);
    await userCredential.seed(trx, userIds);
    await userToken.seed(trx, userIds);
    await todo.seed(trx, userIds);
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
