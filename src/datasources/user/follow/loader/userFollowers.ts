import DataLoader from "dataloader";
import type { Kysely } from "kysely";

import type { DB } from "../../../../db/generated/types.ts";
import type { Follow } from "../../../../db/models/follow.ts";
import type { User } from "../../../../db/models/user.ts";

export type Key = Follow["followeeId"];

export type Params = Pagination;

type Pagination = {
  cursor?: Follow["id"];
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
    const followers = await db
      .with("results", (db) =>
        db
          .selectFrom("Follow")
          .innerJoin("User", "followerId", "User.id")
          .where("followeeId", "in", keys)
          .$if(cursor != null, (qb) => qb.where(({ eb }) => eb("Follow.id", comp, cursor!)))
          .selectAll("User")
          .select("followeeId")
          .select("Follow.id as fid")
          .select(({ fn }) =>
            fn
              .agg<number>("row_number")
              .over((ob) =>
                ob //
                  .partitionBy("followeeId")
                  .orderBy("Follow.id", direction),
              )
              .as("nth"),
          ),
      )
      .selectFrom("results")
      .where("nth", "<=", limit)
      .selectAll()
      .orderBy("fid", direction)
      .execute();

    // 順序は維持してくれるみたい
    const userFollowers = Map.groupBy(
      followers as (User & Pick<Follow, "followeeId"> & { fid: Follow["id"] } & { nth: number })[],
      (follower) => follower.followeeId,
    );

    return keys.map((key) => userFollowers.get(key) ?? []);
  };

  const loader = new DataLoader(batchGet);

  return (params: Params) => {
    sharedParams ??= params;
    return loader;
  };
};
