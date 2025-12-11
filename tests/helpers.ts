import { client } from "../src/db/client.ts";
import type { Todo } from "../src/models/todo.ts";
import type { UserFull } from "../src/models/user.ts";

export const clearTables = async () => {
  // CASCADE other tables
  await clearUsers();
};

export const clearTodos = async () => {
  await client.deleteFrom("todos").executeTakeFirstOrThrow();
};

export const clearUsers = async () => {
  await client.deleteFrom("users").executeTakeFirstOrThrow();
};

export function fail(): never {
  throw new Error();
}

export const seed = {
  user: (users: UserFull[]) =>
    client.transaction().execute(async (trx) => {
      const seeds = users.map(async ({ password, token, ...data }) => {
        await trx
          .insertInto("users") //
          .values(data)
          .executeTakeFirstOrThrow();

        return await Promise.all([
          trx
            .insertInto("userCredentials")
            .values({ userId: data.id, updatedAt: data.updatedAt, password })
            .executeTakeFirstOrThrow(),
          trx
            .insertInto("userTokens")
            .values({ userId: data.id, updatedAt: data.updatedAt, token })
            .executeTakeFirstOrThrow(),
        ]);
      });

      return await Promise.all(seeds);
    }),
  todo: (todos: Todo[]) =>
    client
      .insertInto("todos") //
      .values(todos)
      .executeTakeFirstOrThrow(),
};
