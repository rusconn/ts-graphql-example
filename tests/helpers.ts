import { db } from "../src/db/client.ts";

export const clearTables = async () => {
  // CASCADE Post
  await clearUsers();
};

export const clearPosts = async () => {
  await db.deleteFrom("Post").executeTakeFirstOrThrow();
};

export const clearUsers = async () => {
  await db.deleteFrom("User").executeTakeFirstOrThrow();
};

export function fail(): never {
  throw new Error();
}
