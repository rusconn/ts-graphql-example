import { client } from "../src/db/client.ts";
import type { Todo, User, UserCredential, UserToken } from "../src/db/types.ts";

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

type UserFull = User & //
  Pick<UserCredential, "password"> &
  Pick<UserToken, "refreshToken" | "lastUsedAt">;

export const seed = {
  user: (users: UserFull[]) =>
    client.transaction().execute(async (trx) => {
      const seeds = users.map(async ({ password, refreshToken, lastUsedAt, ...rest }) => {
        await trx
          .insertInto("users") //
          .values(rest)
          .executeTakeFirstOrThrow();

        return await Promise.all([
          trx
            .insertInto("userCredentials")
            .values({ userId: rest.id, password })
            .executeTakeFirstOrThrow(),
          trx
            .insertInto("userTokens") //
            .values({ userId: rest.id, refreshToken, lastUsedAt })
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
