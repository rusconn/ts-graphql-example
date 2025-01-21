import { client } from "../src/db/client.ts";
import type { Post } from "../src/models/post.ts";
import type { UserFull } from "../src/models/user.ts";

export const clearTables = async () => {
  // CASCADE other tables
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

export const seed = {
  user: (users: UserFull[]) =>
    client.transaction().execute(async (trx) => {
      const seeds = users.map(async ({ password, token, ...data }) => {
        await trx
          .insertInto("User") //
          .values(data)
          .executeTakeFirstOrThrow();

        return await Promise.all([
          trx
            .insertInto("UserCredential")
            .values({ userId: data.id, updatedAt: data.updatedAt, password })
            .executeTakeFirstOrThrow(),
          trx
            .insertInto("UserToken")
            .values({ userId: data.id, updatedAt: data.updatedAt, token })
            .executeTakeFirstOrThrow(),
        ]);
      });

      return await Promise.all(seeds);
    }),
  post: (posts: Post[]) =>
    client
      .insertInto("Post") //
      .values(posts)
      .executeTakeFirstOrThrow(),
};
