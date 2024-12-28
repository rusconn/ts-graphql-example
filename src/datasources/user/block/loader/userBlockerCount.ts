import DataLoader from "dataloader";
import type { Kysely } from "kysely";

import type { DB } from "../../../../db/generated/types.ts";
import type { Block } from "../../../../db/models/block.ts";
import { sort } from "../../../../lib/dataloader/sort.ts";

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
    .select(({ fn }) => fn.count("blockeeId").as("count"))
    .execute();

  type Count = Pick<Block, "blockeeId"> & Pick<(typeof counts)[number], "count">;

  return sort(keys, counts as Count[], (count) => count.blockeeId) //
    .map((result) => Number(result?.count ?? 0));
};
