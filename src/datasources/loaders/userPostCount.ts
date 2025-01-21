import DataLoader from "dataloader";
import type { Kysely } from "kysely";

import type { DB } from "../../db/types.ts";
import { sort } from "../../lib/dataloader/sort.ts";
import type { Post } from "../../models/post.ts";

export type Key = Post["authorId"];

export const init = (db: Kysely<DB>) => {
  return new DataLoader(batchGet(db));
};

const batchGet = (db: Kysely<DB>) => async (keys: readonly Key[]) => {
  const counts = await db
    .selectFrom("Post")
    .where("authorId", "in", keys)
    .groupBy("authorId")
    .select("authorId")
    .select(({ fn }) => fn.count<number>("authorId").as("count"))
    .execute();

  type Count = {
    authorId: Key;
    count: number;
  };

  const defaultValue = {
    authorId: "",
    count: 0,
  } as Count;

  return sort(keys, counts as Count[], (count) => count.authorId, defaultValue).map(
    ({ count }) => count,
  );
};
