import DataLoader from "dataloader";
import type { Kysely } from "kysely";

import type { DB } from "../../db/types.ts";
import { sortGroup } from "../../lib/dataloader/sortGroup.ts";
import type { Follow } from "../../models/follow.ts";
import type { User } from "../../models/user.ts";

export type Key = {
  followerId: Follow["followerId"];
  reverse: boolean;
  cursor?: Follow;
  limit: number;
};

export type Following = {
  user: User;
  cursor: Follow;
};

export const init = (db: Kysely<DB>) => {
  return new DataLoader(batchGet(db), { cacheKeyFn: JSON.stringify });
};

const batchGet = (db: Kysely<DB>) => async (keys: readonly Key[]) => {
  const followerIds = keys.map((key) => key.followerId);
  const { reverse, cursor, limit } = keys.at(0)!;

  const [direction, comp] = reverse
    ? (["desc", "<"] as const) //
    : (["asc", ">"] as const);

  const followings = await db
    .selectFrom("User")
    .innerJoinLateral(
      (eb) =>
        eb
          .selectFrom("User as u")
          .innerJoin("Follow as f", "u.id", "f.followeeId")
          .whereRef("User.id", "=", "f.followerId")
          .$if(cursor != null, (qb) =>
            qb.where(({ eb, refTuple, tuple }) =>
              eb(
                refTuple("f.createdAt", "f.followerId", "f.followeeId"),
                comp,
                tuple(cursor!.createdAt, cursor!.followerId, cursor!.followeeId),
              ),
            ),
          )
          .selectAll("u")
          .select([
            "f.createdAt as fcreatedAt",
            "f.followerId as ffollowerId",
            "f.followeeId as ffolloweeId",
          ])
          .orderBy("f.createdAt", direction)
          .orderBy("f.followerId", direction)
          .orderBy("f.followeeId", direction)
          .limit(limit)
          .as("followings"),
      (join) => join.onTrue(),
    )
    .where("User.id", "in", followerIds)
    .selectAll("followings")
    // サブクエリの結果順を維持することを想定して order by は指定していない
    .execute();

  const formattedFollowings = followings.map(
    ({ fcreatedAt, ffollowerId, ffolloweeId, ...user }) => ({
      user,
      cursor: {
        createdAt: fcreatedAt,
        followerId: ffollowerId,
        followeeId: ffolloweeId,
      },
    }),
  ) as Following[];

  return sortGroup(followerIds, formattedFollowings, (following) => following.cursor.followerId);
};
