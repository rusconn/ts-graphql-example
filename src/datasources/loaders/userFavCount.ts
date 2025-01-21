import DataLoader from "dataloader";
import type { Kysely } from "kysely";

import type { DB } from "../../db/types.ts";
import { sort } from "../../lib/dataloader/sort.ts";
import type { Like } from "../../models/like.ts";

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
    .select(({ fn }) => fn.count<number>("userId").as("count"))
    .execute();

  type Count = {
    userId: Key;
    count: number;
  };

  const defaultValue = {
    userId: "",
    count: 0,
  } as Count;

  return sort(keys, counts as Count[], (count) => count.userId, defaultValue).map(
    ({ count }) => count,
  );
};
