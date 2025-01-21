import DataLoader from "dataloader";
import type { Kysely } from "kysely";

import type { DB } from "../../db/types.ts";
import { sort } from "../../lib/dataloader/sort.ts";
import type { Post } from "../../models/post.ts";

export type Key = Pick<Post, "id" | "authorId">;

export const init = (db: Kysely<DB>) => {
  return new DataLoader(batchGet(db), { cacheKeyFn: combine });
};

const batchGet = (db: Kysely<DB>) => async (keys: readonly Key[]) => {
  const posts = await db
    .selectFrom("Post")
    .where(({ eb, refTuple, tuple }) =>
      eb(
        refTuple("id", "authorId"),
        "in",
        keys.map((key) => tuple(key.id, key.authorId)),
      ),
    )
    .selectAll()
    .execute();

  return sort(keys.map(combine), posts as Post[], combine);
};

const combine = (key: Key) => {
  return key.id + key.authorId;
};
