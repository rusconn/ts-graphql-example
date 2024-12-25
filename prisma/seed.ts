import process from "node:process";

import { db } from "../src/db/client.ts";
import * as todo from "./seeds/todo.ts";
import * as user from "./seeds/user.ts";

const seed = async () => {
  await db.transaction().execute(async (tsx) => {
    const userIds = await user.seed(tsx);
    await todo.seed(tsx, userIds);
  });
};

try {
  await seed();
} catch (e) {
  console.error(e);
  process.exitCode = 1;
} finally {
  await db.destroy();
}
