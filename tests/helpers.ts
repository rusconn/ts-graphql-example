import { db } from "../src/db/client.ts";

export const clearTables = async () => {
  // CASCADE Todo
  await clearUsers();
};

export const clearTodos = async () => {
  await db.deleteFrom("Todo").executeTakeFirstOrThrow();
};

export const clearUsers = async () => {
  await db.deleteFrom("User").executeTakeFirstOrThrow();
};

export function fail(): never {
  throw new Error();
}
