import DataLoader from "dataloader";
import type { Kysely } from "kysely";
import type { SetNonNullable } from "type-fest";

import type { DB } from "../../db/generated/types.ts";
import type { Post } from "../../db/models/post.ts";
import { sort } from "../../lib/dataloader/sort.ts";

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
    .select(({ fn }) => fn.count("parentId").as("count"))
    .execute();

  // SetNonNullable: parentId が NULL のレコードは返されない
  type Count = Pick<SetNonNullable<Post, "parentId">, "parentId"> &
    Pick<(typeof counts)[number], "count">;

  return sort(keys, counts as Count[], (count) => count.parentId) //
    .map((result) => Number(result?.count ?? 0));
};
