import DataLoader from "dataloader";
import type { Kysely } from "kysely";

import type { DB } from "../../db/generated/types.ts";
import type { Post } from "../../db/models/post.ts";
import { sort } from "../../lib/dataloader/sort.ts";

export type Key = Pick<Post, "id" | "userId">;

export const init = (db: Kysely<DB>) => {
  return new DataLoader(batchGet(db), { cacheKeyFn: combine });
};

const batchGet = (db: Kysely<DB>) => async (keys: readonly Key[]) => {
  const posts = await db
    .selectFrom("Post")
    .where(({ eb, refTuple, tuple }) =>
      eb(
        refTuple("id", "userId"),
        "in",
        keys.map((key) => tuple(key.id, key.userId)),
      ),
    )
    .selectAll()
    .execute();

  return sort(keys.map(combine), posts as Post[], combine);
};

const combine = (key: Key) => {
  return key.id + key.userId;
};
