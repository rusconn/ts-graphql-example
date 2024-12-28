import DataLoader from "dataloader";
import type { Kysely } from "kysely";

import type { DB } from "../../../../db/generated/types.ts";
import type { Follow } from "../../../../db/models/follow.ts";
import { sort } from "../../../../lib/dataloader/sort.ts";

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
    .select(({ fn }) => fn.count("followeeId").as("count"))
    .execute();

  type Count = Pick<Follow, "followeeId"> & Pick<(typeof counts)[number], "count">;

  return sort(keys, counts as Count[], (count) => count.followeeId) //
    .map((result) => Number(result?.count ?? 0));
};
