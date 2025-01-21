import DataLoader from "dataloader";
import type { Kysely } from "kysely";

import type { DB } from "../../db/types.ts";
import { sortGroup } from "../../lib/dataloader/sortGroup.ts";
import type { Like } from "../../models/like.ts";
import type { Post } from "../../models/post.ts";

export type Key = {
  userId: Like["userId"];
  reverse: boolean;
  cursor?: Like;
  limit: number;
};

export type Fav = {
  post: Post;
  cursor: Like;
};

export const init = (db: Kysely<DB>) => {
  return new DataLoader(batchGet(db), { cacheKeyFn: JSON.stringify });
};

const batchGet = (db: Kysely<DB>) => async (keys: readonly Key[]) => {
  const userIds = keys.map((key) => key.userId);
  const { reverse, cursor, limit } = keys.at(0)!;

  const [direction, comp] = reverse
    ? (["desc", "<"] as const) //
    : (["asc", ">"] as const);

  const favs = await db
    .selectFrom("User")
    .innerJoinLateral(
      (eb) =>
        eb
          .selectFrom("Post as p")
          .innerJoin("Like as l", "p.id", "l.postId")
          .whereRef("User.id", "=", "l.userId")
          .$if(cursor != null, (qb) =>
            qb.where(({ eb, refTuple, tuple }) =>
              eb(
                refTuple("l.createdAt", "l.userId", "l.postId"),
                comp,
                tuple(cursor!.createdAt, cursor!.userId, cursor!.postId),
              ),
            ),
          )
          .selectAll("p")
          .select([
            "l.createdAt as lcreatedAt", //
            "l.userId as luserId",
            "l.postId as lpostId",
          ])
          .orderBy("l.createdAt", direction)
          .orderBy("l.userId", direction)
          .orderBy("l.postId", direction)
          .limit(limit)
          .as("favs"),
      (join) => join.onTrue(),
    )
    .where("User.id", "in", userIds)
    .selectAll("favs")
    // サブクエリの結果順を維持することを想定して order by は指定していない
    .execute();

  const formattedFavs = favs.map(({ lcreatedAt, luserId, lpostId, ...post }) => ({
    post,
    cursor: {
      createdAt: lcreatedAt,
      userId: luserId,
      postId: lpostId,
    },
  })) as Fav[];

  return sortGroup(userIds, formattedFavs, (fav) => fav.cursor.userId);
};
