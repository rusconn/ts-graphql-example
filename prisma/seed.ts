import { db } from "@/db/mod.ts";
import * as todo from "./seeds/todo.ts";
import * as user from "./seeds/user.ts";

const seed = async () => {
  const userIds = await user.seed();
  await todo.seed(userIds);
};

try {
  await seed();
} catch (e) {
  console.error(e);
} finally {
  await db.destroy();
}
