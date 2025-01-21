import DataLoader from "dataloader";
import type { Kysely } from "kysely";

import type { DB } from "../../db/generated/types.ts";
import type { Like } from "../../db/models/like.ts";
import type { Post } from "../../db/models/post.ts";

export type Key = Like["userId"];

export type Params = Pagination;

type Pagination = {
  cursor?: Like;
  limit: number;
  reverse: boolean;
};

export type Fav = {
  post: Post;
  cursor: Like;
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
    const favs = await db
      .with("results", (db) =>
        db
          .selectFrom("Post")
          .innerJoin("Like", "Post.id", "Like.postId")
          .where("Like.userId", "in", keys)
          .$if(cursor != null, (qb) =>
            qb.where(({ eb, refTuple, tuple }) =>
              eb(
                refTuple("Like.createdAt", "Like.userId", "Like.postId"),
                comp,
                tuple(cursor!.createdAt, cursor!.userId, cursor!.postId),
              ),
            ),
          )
          .selectAll("Post")
          .select([
            "Like.createdAt as lcreatedAt",
            "Like.userId as luserId",
            "Like.postId as lpostId",
          ])
          .select(({ fn }) =>
            fn
              .agg<number>("row_number")
              .over((ob) =>
                ob
                  .partitionBy("Like.userId")
                  .orderBy("Like.createdAt", direction)
                  .orderBy("Like.userId", direction)
                  .orderBy("Like.postId", direction),
              )
              .as("nth"),
          ),
      )
      .selectFrom("results")
      .where("nth", "<=", limit)
      .select([
        "id",
        "updatedAt",
        "content",
        "status",
        "userId",
        "parentId",
        "lcreatedAt",
        "luserId",
        "lpostId",
      ])
      .orderBy("nth", "asc")
      .execute();

    const formattedFavs = favs.map(({ lcreatedAt, luserId, lpostId, ...post }) => ({
      post,
      cursor: {
        createdAt: lcreatedAt,
        userId: luserId,
        postId: lpostId,
      },
    })) as Fav[];

    // 順序は維持してくれるみたい
    const userFavs = Map.groupBy(formattedFavs, (fav) => fav.cursor.userId);

    return keys.map((key) => userFavs.get(key) ?? []);
  };

  const loader = new DataLoader(batchGet);

  return (params: Params) => {
    sharedParams ??= params;
    return loader;
  };
};
