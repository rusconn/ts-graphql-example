import DataLoader from "dataloader";
import type { Kysely } from "kysely";

import type { DB } from "../../db/generated/types.ts";
import type { Like } from "../../db/models/like.ts";
import type { User } from "../../db/models/user.ts";

export type Key = Like["postId"];

export type Params = Pagination;

type Pagination = {
  cursor?: Like;
  limit: number;
  reverse: boolean;
};

export type Liker = {
  user: User;
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
    const likers = await db
      .with("results", (db) =>
        db
          .selectFrom("User")
          .innerJoin("Like", "User.id", "Like.userId")
          .where("Like.postId", "in", keys)
          .$if(cursor != null, (qb) =>
            qb.where(({ eb, refTuple, tuple }) =>
              eb(
                refTuple("Like.createdAt", "Like.userId", "Like.postId"),
                comp,
                tuple(cursor!.createdAt, cursor!.userId, cursor!.postId),
              ),
            ),
          )
          .selectAll("User")
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
                  .partitionBy("Like.postId")
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
        "avatar",
        "name",
        "handle",
        "bio",
        "location",
        "website",
        "email",
        "password",
        "token",
        "lcreatedAt",
        "luserId",
        "lpostId",
      ])
      .orderBy("nth", "asc")
      .execute();

    const formattedLikers = likers.map(({ lcreatedAt, luserId, lpostId, ...user }) => ({
      user,
      cursor: {
        createdAt: lcreatedAt,
        userId: luserId,
        postId: lpostId,
      },
    })) as Liker[];

    // 順序は維持してくれるみたい
    const postLikers = Map.groupBy(formattedLikers, (liker) => liker.cursor.postId);

    return keys.map((key) => postLikers.get(key) ?? []);
  };

  const loader = new DataLoader(batchGet);

  return (params: Params) => {
    sharedParams ??= params;
    return loader;
  };
};
