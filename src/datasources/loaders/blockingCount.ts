import DataLoader from "dataloader";
import type { Kysely } from "kysely";

import type { DB } from "../../db/generated/types.ts";
import type { Block } from "../../db/models/block.ts";
import { sort } from "../../lib/dataloader/sort.ts";

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
    .select(({ fn }) => fn.count("blockerId").as("count"))
    .execute();

  type Count = Pick<Block, "blockerId"> & Pick<(typeof counts)[number], "count">;

  return sort(keys, counts as Count[], (count) => count.blockerId) //
    .map((result) => Number(result?.count ?? 0));
};
