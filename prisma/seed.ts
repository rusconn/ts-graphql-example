import { client } from "../src/db/client.ts";
import * as post from "./seeds/post.ts";
import * as user from "./seeds/user.ts";

const seed = async () => {
  await client.transaction().execute(async (trx) => {
    const userIds = await user.seed(trx);
    await post.seed(trx, userIds);
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
