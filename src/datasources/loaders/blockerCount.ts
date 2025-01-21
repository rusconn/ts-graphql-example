import DataLoader from "dataloader";
import type { Kysely } from "kysely";

import type { DB } from "../../db/types.ts";
import { sort } from "../../lib/dataloader/sort.ts";
import type { Block } from "../../models/block.ts";

export type Key = Block["blockeeId"];

export const init = (db: Kysely<DB>) => {
  return new DataLoader(batchGet(db));
};

const batchGet = (db: Kysely<DB>) => async (keys: readonly Key[]) => {
  const counts = await db
    .selectFrom("Block")
    .where("blockeeId", "in", keys)
    .groupBy("blockeeId")
    .select("blockeeId")
    .select(({ fn }) => fn.count<number>("blockeeId").as("count"))
    .execute();

  type Count = {
    blockeeId: Key;
    count: number;
  };

  const defaultValue = {
    blockeeId: "",
    count: 0,
  } as Count;

  return sort(keys, counts as Count[], (count) => count.blockeeId, defaultValue).map(
    ({ count }) => count,
  );
};
