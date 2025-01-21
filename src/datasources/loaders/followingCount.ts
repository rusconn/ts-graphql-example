import DataLoader from "dataloader";
import type { Kysely } from "kysely";

import type { DB } from "../../db/types.ts";
import { sort } from "../../lib/dataloader/sort.ts";
import type { Follow } from "../../models/follow.ts";

export type Key = Follow["followerId"];

export const init = (db: Kysely<DB>) => {
  return new DataLoader(batchGet(db));
};

const batchGet = (db: Kysely<DB>) => async (keys: readonly Key[]) => {
  const counts = await db
    .selectFrom("Follow")
    .where("followerId", "in", keys)
    .groupBy("followerId")
    .select("followerId")
    .select(({ fn }) => fn.count<number>("followerId").as("count"))
    .execute();

  type Count = {
    followerId: Key;
    count: number;
  };

  const defaultValue = {
    followerId: "",
    count: 0,
  } as Count;

  return sort(keys, counts as Count[], (count) => count.followerId, defaultValue).map(
    ({ count }) => count,
  );
};
