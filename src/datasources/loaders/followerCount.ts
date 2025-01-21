import DataLoader from "dataloader";
import type { Kysely } from "kysely";

import type { DB } from "../../db/types.ts";
import { sort } from "../../lib/dataloader/sort.ts";
import type { Follow } from "../../models/follow.ts";

export type Key = Follow["followeeId"];

export const init = (db: Kysely<DB>) => {
  return new DataLoader(batchGet(db));
};

const batchGet = (db: Kysely<DB>) => async (keys: readonly Key[]) => {
  const counts = await db
    .selectFrom("Follow")
    .where("followeeId", "in", keys)
    .groupBy("followeeId")
    .select("followeeId")
    .select(({ fn }) => fn.count<number>("followeeId").as("count"))
    .execute();

  type Count = {
    followeeId: Key;
    count: number;
  };

  const defaultValue = {
    followeeId: "",
    count: 0,
  } as Count;

  return sort(keys, counts as Count[], (count) => count.followeeId, defaultValue).map(
    ({ count }) => count,
  );
};
