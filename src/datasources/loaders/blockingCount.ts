import DataLoader from "dataloader";
import type { Kysely } from "kysely";

import type { DB } from "../../db/types.ts";
import { sort } from "../../lib/dataloader/sort.ts";
import type { Block } from "../../models/block.ts";

export type Key = Block["blockerId"];

export const init = (db: Kysely<DB>) => {
  return new DataLoader(batchGet(db));
};

const batchGet = (db: Kysely<DB>) => async (keys: readonly Key[]) => {
  const counts = await db
    .selectFrom("Block")
    .where("blockerId", "in", keys)
    .groupBy("blockerId")
    .select("blockerId")
    .select(({ fn }) => fn.count<number>("blockerId").as("count"))
    .execute();

  type Count = {
    blockerId: Key;
    count: number;
  };

  const defaultValue = {
    blockerId: "",
    count: 0,
  } as Count;

  return sort(keys, counts as Count[], (count) => count.blockerId, defaultValue).map(
    ({ count }) => count,
  );
};
