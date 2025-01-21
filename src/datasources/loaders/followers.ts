import DataLoader from "dataloader";
import type { Kysely } from "kysely";

import type { DB } from "../../db/generated/types.ts";
import type { Follow } from "../../db/models/follow.ts";
import type { User } from "../../db/models/user.ts";

export type Key = Follow["followeeId"];

export type Params = Pagination;

type Pagination = {
  cursor?: Follow;
  limit: number;
  reverse: boolean;
};

export type Follower = {
  user: User;
  cursor: Follow;
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
    const followers = await db
      .with("results", (db) =>
        db
          .selectFrom("User")
          .innerJoin("Follow", "User.id", "Follow.followerId")
          .where("Follow.followeeId", "in", keys)
          .$if(cursor != null, (qb) =>
            qb.where(({ eb, refTuple, tuple }) =>
              eb(
                refTuple("Follow.createdAt", "Follow.followerId", "Follow.followeeId"),
                comp,
                tuple(cursor!.createdAt, cursor!.followerId, cursor!.followeeId),
              ),
            ),
          )
          .selectAll("User")
          .select([
            "Follow.createdAt as fcreatedAt",
            "Follow.followerId as ffollowerId",
            "Follow.followeeId as ffolloweeId",
          ])
          .select(({ fn }) =>
            fn
              .agg<number>("row_number")
              .over((ob) =>
                ob
                  .partitionBy("Follow.followeeId")
                  .orderBy("Follow.createdAt", direction)
                  .orderBy("Follow.followerId", direction)
                  .orderBy("Follow.followeeId", direction),
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
        "fcreatedAt",
        "ffollowerId",
        "ffolloweeId",
      ])
      .orderBy("nth", "asc")
      .execute();

    const formattedFollowers = followers.map(
      ({ fcreatedAt, ffollowerId, ffolloweeId, ...user }) => ({
        user,
        cursor: {
          createdAt: fcreatedAt,
          followerId: ffollowerId,
          followeeId: ffolloweeId,
        },
      }),
    ) as Follower[];

    // 順序は維持してくれるみたい
    const userFollowers = Map.groupBy(formattedFollowers, (follower) => follower.cursor.followeeId);

    return keys.map((key) => userFollowers.get(key) ?? []);
  };

  const loader = new DataLoader(batchGet);

  return (params: Params) => {
    sharedParams ??= params;
    return loader;
  };
};
