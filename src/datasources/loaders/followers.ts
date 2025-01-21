import DataLoader from "dataloader";
import type { Kysely } from "kysely";

import type { DB } from "../../db/types.ts";
import { sortGroup } from "../../lib/dataloader/sortGroup.ts";
import type { Follow } from "../../models/follow.ts";
import type { User } from "../../models/user.ts";

export type Key = {
  followeeId: Follow["followeeId"];
  reverse: boolean;
  cursor?: Follow;
  limit: number;
};

export type Follower = {
  user: User;
  cursor: Follow;
};

export const init = (db: Kysely<DB>) => {
  return new DataLoader(batchGet(db), { cacheKeyFn: JSON.stringify });
};

const batchGet = (db: Kysely<DB>) => async (keys: readonly Key[]) => {
  const followeeIds = keys.map((key) => key.followeeId);
  const { reverse, cursor, limit } = keys.at(0)!;

  const [direction, comp] = reverse
    ? (["desc", "<"] as const) //
    : (["asc", ">"] as const);

  const followers = await db
    .selectFrom("User")
    .innerJoinLateral(
      (eb) =>
        eb
          .selectFrom("User as u")
          .innerJoin("Follow as f", "u.id", "f.followerId")
          .whereRef("User.id", "=", "f.followeeId")
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
          .as("followers"),
      (join) => join.onTrue(),
    )
    .where("User.id", "in", followeeIds)
    .selectAll("followers")
    // サブクエリの結果順を維持することを想定して order by は指定していない
    .execute();

  const formattedFollowers = followers.map(({ fcreatedAt, ffollowerId, ffolloweeId, ...user }) => ({
    user,
    cursor: {
      createdAt: fcreatedAt,
      followerId: ffollowerId,
      followeeId: ffolloweeId,
    },
  })) as Follower[];

  return sortGroup(followeeIds, formattedFollowers, (follower) => follower.cursor.followeeId);
};
