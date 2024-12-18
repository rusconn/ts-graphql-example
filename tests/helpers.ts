import { client } from "../src/db/client.ts";

export const clearTables = async () => {
  // CASCADE Post
  await clearUsers();
};

export const clearPosts = async () => {
  await client.deleteFrom("Post").executeTakeFirstOrThrow();
};

export const clearUsers = async () => {
  await client.deleteFrom("User").executeTakeFirstOrThrow();
};

export function fail(): never {
  throw new Error();
}
