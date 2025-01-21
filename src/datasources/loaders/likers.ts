import DataLoader from "dataloader";
import type { Kysely } from "kysely";

import type { DB } from "../../db/types.ts";
import { sortGroup } from "../../lib/dataloader/sortGroup.ts";
import type { Like } from "../../models/like.ts";
import type { User } from "../../models/user.ts";

export type Key = {
  postId: Like["postId"];
  reverse: boolean;
  cursor?: Like;
  limit: number;
};

export type Liker = {
  user: User;
  cursor: Like;
};

export const init = (db: Kysely<DB>) => {
  return new DataLoader(batchGet(db), { cacheKeyFn: JSON.stringify });
};

const batchGet = (db: Kysely<DB>) => async (keys: readonly Key[]) => {
  const postIds = keys.map((key) => key.postId);
  const { reverse, cursor, limit } = keys.at(0)!;

  const [direction, comp] = reverse
    ? (["desc", "<"] as const) //
    : (["asc", ">"] as const);

  const likers = await db
    .selectFrom("Post")
    .innerJoinLateral(
      (eb) =>
        eb
          .selectFrom("User as u")
          .innerJoin("Like as l", "u.id", "l.userId")
          .whereRef("Post.id", "=", "l.postId")
          .$if(cursor != null, (qb) =>
            qb.where(({ eb, refTuple, tuple }) =>
              eb(
                refTuple("l.createdAt", "l.userId", "l.postId"),
                comp,
                tuple(cursor!.createdAt, cursor!.userId, cursor!.postId),
              ),
            ),
          )
          .selectAll("u")
          .select([
            "l.createdAt as lcreatedAt", //
            "l.userId as luserId",
            "l.postId as lpostId",
          ])
          .orderBy("l.createdAt", direction)
          .orderBy("l.userId", direction)
          .orderBy("l.postId", direction)
          .limit(limit)
          .as("likers"),
      (join) => join.onTrue(),
    )
    .where("Post.id", "in", postIds)
    .selectAll("likers")
    // サブクエリの結果順を維持することを想定して order by は指定していない
    .execute();

  const formattedLikers = likers.map(({ lcreatedAt, luserId, lpostId, ...user }) => ({
    user,
    cursor: {
      createdAt: lcreatedAt,
      userId: luserId,
      postId: lpostId,
    },
  })) as Liker[];

  return sortGroup(postIds, formattedLikers, (liker) => liker.cursor.postId);
};
