import DataLoader from "dataloader";
import type { Kysely } from "kysely";

import type { DB } from "../../../../db/generated/types.ts";
import type { Like } from "../../../../db/models/like.ts";
import { sort } from "../../../../lib/dataloader/sort.ts";

export type Key = Like["userId"];

export const init = (db: Kysely<DB>) => {
  return new DataLoader(batchGet(db));
};

const batchGet = (db: Kysely<DB>) => async (keys: readonly Key[]) => {
  const counts = await db
    .selectFrom("Like")
    .where("userId", "in", keys)
    .groupBy("userId")
    .select("userId")
    .select(({ fn }) => fn.count("userId").as("count"))
    .execute();

  type Count = Pick<Like, "userId"> & Pick<(typeof counts)[number], "count">;

  return sort(keys, counts as Count[], (count) => count.userId) //
    .map((result) => Number(result?.count ?? 0));
};
