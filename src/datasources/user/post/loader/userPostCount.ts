import DataLoader from "dataloader";
import type { Kysely } from "kysely";

import type { DB } from "../../../../db/generated/types.ts";
import type { Post } from "../../../../db/models/post.ts";
import { sort } from "../../../../lib/dataloader/sort.ts";

type Key = Post["userId"];

export type Params = Record<string, never>;

export const init = (db: Kysely<DB>) => {
  return new DataLoader(batchGet(db));
};

const batchGet = (db: Kysely<DB>) => async (keys: readonly Key[]) => {
  const counts = await db
    .selectFrom("Post")
    .where("userId", "in", keys)
    .groupBy("userId")
    .select("userId")
    .select(({ fn }) => fn.count("userId").as("count"))
    .execute();

  type Count = Pick<Post, "userId"> & Pick<(typeof counts)[number], "count">;

  return sort(keys, counts as Count[], (count) => count.userId) //
    .map((result) => Number(result?.count ?? 0));
};
