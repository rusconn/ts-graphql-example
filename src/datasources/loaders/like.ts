import DataLoader from "dataloader";
import type { Kysely } from "kysely";

import type { DB } from "../../db/types.ts";
import { sort } from "../../lib/dataloader/sort.ts";
import type { Like } from "../../models/like.ts";

export type Key = Pick<Like, "postId" | "userId">;

export const init = (db: Kysely<DB>) => {
  return new DataLoader(batchGet(db), { cacheKeyFn: combine });
};

const batchGet = (db: Kysely<DB>) => async (keys: readonly Key[]) => {
  const likes = await db
    .selectFrom("Like")
    .where(({ eb, refTuple, tuple }) =>
      eb(
        refTuple("postId", "userId"),
        "in",
        keys.map((key) => tuple(key.postId, key.userId)),
      ),
    )
    .selectAll()
    .execute();

  return sort(keys.map(combine), likes as Like[], combine);
};

const combine = (key: Key) => {
  return key.postId + key.userId;
};
