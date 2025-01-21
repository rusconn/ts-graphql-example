import DataLoader from "dataloader";
import type { Kysely } from "kysely";

import type { DB } from "../../db/types.ts";
import { sort } from "../../lib/dataloader/sort.ts";
import type { Post } from "../../models/post.ts";

export type Key = Post["id"];

export const init = (db: Kysely<DB>) => {
  return new DataLoader(batchGet(db));
};

const batchGet = (db: Kysely<DB>) => async (keys: readonly Key[]) => {
  const counts = await db
    .selectFrom("Post")
    .where("parentId", "in", keys)
    .groupBy("parentId")
    .select("parentId")
    .select(({ fn }) => fn.count<number>("parentId").as("count"))
    .execute();

  type Count = {
    parentId: Key;
    count: number;
  };

  const defaultValue = {
    parentId: "",
    count: 0,
  } as Count;

  return sort(keys, counts as Count[], (count) => count.parentId, defaultValue).map(
    ({ count }) => count,
  );
};
