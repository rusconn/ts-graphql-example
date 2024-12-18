import DataLoader from "dataloader";
import type { Kysely } from "kysely";

import type { DB } from "../../../../db/generated/types.ts";
import type { Post } from "../../../../db/models/post.ts";

type Key = Post["userId"];

export type Params = Pagination;

type Pagination = {
  cursor?: Post["id"];
  sortKey: "createdAt" | "updatedAt";
  limit: number;
  reverse: boolean;
};

export const initClosure = (db: Kysely<DB>) => {
  let sharedParams: Params | undefined;

  const batchGet = async (keys: readonly Key[]) => {
    const { cursor, sortKey, limit, reverse } = sharedParams!;

    const orderColumn = sortKey === "createdAt" ? "id" : sortKey;

    const [direction, comp] = reverse //
      ? (["desc", "<"] as const)
      : (["asc", ">"] as const);

    const cursorOrderColumn =
      cursor &&
      db //
        .selectFrom("Post")
        .where("id", "=", cursor)
        .select(orderColumn);

    // 本当は各 key に対する select limit を union all したいが、
    // kysely が集合演算を正しく実装していないようなので別の方法で実現した。
    // クエリの効率は悪いが、全件取得後にオンメモリで limit するよりマシ。
    const posts = await db
      .with("results", (db) =>
        db
          .selectFrom("Post")
          .where("userId", "in", keys)
          .$if(cursorOrderColumn != null, (qb) =>
            qb.where(({ eb }) =>
              eb.or([
                eb(orderColumn, comp, cursorOrderColumn!),
                eb.and([
                  //
                  eb(orderColumn, "=", cursorOrderColumn!),
                  eb("id", comp, cursor!),
                ]),
              ]),
            ),
          )
          .selectAll()
          .select(({ fn }) =>
            fn
              .agg<number>("row_number")
              .over((x) =>
                x //
                  .partitionBy("userId")
                  .orderBy(orderColumn, direction)
                  .orderBy("id", direction),
              )
              .as("nth"),
          ),
      )
      .selectFrom("results")
      .where("nth", "<=", limit)
      .selectAll()
      .orderBy(orderColumn, direction)
      .orderBy("id", direction)
      .execute();

    // 順序は維持してくれるみたい
    const userPosts = Map.groupBy(posts as (Post & { nth: number })[], (post) => post.userId);

    return keys.map((key) => userPosts.get(key) ?? []);
  };

  const loader = new DataLoader(batchGet);

  return (params: Params) => {
    sharedParams ??= params;
    return loader;
  };
};
