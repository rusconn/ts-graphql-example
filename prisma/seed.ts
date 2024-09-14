import { db } from "@/db/client.ts";
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
} finally {
  await db.destroy();
}
