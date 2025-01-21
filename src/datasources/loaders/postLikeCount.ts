import DataLoader from "dataloader";
import type { Kysely } from "kysely";

import type { DB } from "../../db/types.ts";
import { sort } from "../../lib/dataloader/sort.ts";
import type { Like } from "../../models/like.ts";

export type Key = Like["postId"];

export const init = (db: Kysely<DB>) => {
  return new DataLoader(batchGet(db));
};

const batchGet = (db: Kysely<DB>) => async (keys: readonly Key[]) => {
  const counts = await db
    .selectFrom("Like")
    .where("postId", "in", keys)
    .groupBy("postId")
    .select("postId")
    .select(({ fn }) => fn.count<number>("postId").as("count"))
    .execute();

  type Count = {
    postId: Key;
    count: number;
  };

  const defaultValue = {
    postId: "",
    count: 0,
  } as Count;

  return sort(keys, counts as Count[], (count) => count.postId, defaultValue).map(
    ({ count }) => count,
  );
};
