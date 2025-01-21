import DataLoader from "dataloader";
import type { Kysely } from "kysely";

import type { DB } from "../../db/types.ts";
import { sort } from "../../lib/dataloader/sort.ts";
import type { Follow } from "../../models/follow.ts";

export type Key = Pick<Follow, "followerId" | "followeeId">;

export const init = (db: Kysely<DB>) => {
  return new DataLoader(batchGet(db), { cacheKeyFn: combine });
};

const batchGet = (db: Kysely<DB>) => async (keys: readonly Key[]) => {
  const follows = await db
    .selectFrom("Follow")
    .where(({ eb, refTuple, tuple }) =>
      eb(
        refTuple("followerId", "followeeId"),
        "in",
        keys.map((key) => tuple(key.followerId, key.followeeId)),
      ),
    )
    .selectAll()
    .execute();

  return sort(keys.map(combine), follows as Follow[], combine);
};

const combine = (key: Key) => {
  return key.followerId + key.followeeId;
};
