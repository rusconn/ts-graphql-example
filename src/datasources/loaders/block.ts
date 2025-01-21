import DataLoader from "dataloader";
import type { Kysely } from "kysely";

import type { DB } from "../../db/types.ts";
import { sort } from "../../lib/dataloader/sort.ts";
import type { Block } from "../../models/block.ts";

export type Key = Pick<Block, "blockerId" | "blockeeId">;

export const init = (db: Kysely<DB>) => {
  return new DataLoader(batchGet(db), { cacheKeyFn: combine });
};

const batchGet = (db: Kysely<DB>) => async (keys: readonly Key[]) => {
  const blocks = await db
    .selectFrom("Block")
    .where(({ eb, refTuple, tuple }) =>
      eb(
        refTuple("blockerId", "blockeeId"),
        "in",
        keys.map((key) => tuple(key.blockerId, key.blockeeId)),
      ),
    )
    .selectAll()
    .execute();

  return sort(keys.map(combine), blocks as Block[], combine);
};

const combine = (key: Key) => {
  return key.blockerId + key.blockeeId;
};
