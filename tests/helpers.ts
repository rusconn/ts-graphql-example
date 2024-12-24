import { client } from "../src/db/client.ts";

export const clearTables = async () => {
  // CASCADE Todo
  await clearUsers();
};

export const clearTodos = async () => {
  await client.deleteFrom("Todo").executeTakeFirstOrThrow();
};

export const clearUsers = async () => {
  await client.deleteFrom("User").executeTakeFirstOrThrow();
};

export function fail(): never {
  throw new Error();
}
