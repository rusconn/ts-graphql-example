import DataLoader from "dataloader";
import type { Kysely } from "kysely";

import type { DB } from "../../../../db/generated/types.ts";
import type { Like } from "../../../../db/models/like.ts";
import type { Post } from "../../../../db/models/post.ts";

export type Key = Like["userId"];

export type Params = Pagination;

type Pagination = {
  cursor?: Like["id"];
  limit: number;
  reverse: boolean;
};

export const initClosure = (db: Kysely<DB>) => {
  let sharedParams: Params | undefined;

  const batchGet = async (keys: readonly Key[]) => {
    const { cursor, limit, reverse } = sharedParams!;

    const [direction, comp] = reverse //
      ? (["desc", "<"] as const)
      : (["asc", ">"] as const);

    // 本当は各 key に対する select limit を union all したいが、
    // kysely が集合演算を正しく実装していないようなので別の方法で実現した。
    // クエリの効率は悪いが、全件取得後にオンメモリで limit するよりマシ。
    const likeds = await db
      .with("results", (db) =>
        db
          .selectFrom("Like")
          .innerJoin("Post", "Like.postId", "Post.id")
          .where("Like.userId", "in", keys)
          .$if(cursor != null, (qb) => qb.where(({ eb }) => eb("Like.id", comp, cursor!)))
          .selectAll("Post")
          .select("Like.id as lid")
          .select(({ fn }) =>
            fn
              .agg<number>("row_number")
              .over((ob) =>
                ob //
                  .partitionBy("userId")
                  .orderBy("Like.id", direction),
              )
              .as("nth"),
          ),
      )
      .selectFrom("results")
      .where("nth", "<=", limit)
      .selectAll()
      .orderBy("lid", direction)
      .execute();

    // 順序は維持してくれるみたい
    const userLikeds = Map.groupBy(
      likeds as (Post & Pick<Like, "userId"> & { lid: Like["id"] } & { nth: number })[],
      (liked) => liked.userId,
    );

    return keys.map((key) => userLikeds.get(key) ?? []);
  };

  const loader = new DataLoader(batchGet);

  return (params: Params) => {
    sharedParams ??= params;
    return loader;
  };
};