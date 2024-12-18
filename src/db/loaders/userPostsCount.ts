import DataLoader from "dataloader";
import type { Kysely } from "kysely";

import type { UserSelect } from "../models.ts";
import type { DB } from "../types.ts";
import { sort } from "./common.ts";

export type Key = Pick<UserSelect, "id">;

export const initClosure = (db: Kysely<DB>) => {
  const batchGet = async (keys: readonly Key[]) => {
    const posts = await db
      .selectFrom("Post")
      .where(
        "userId",
        "in",
        keys.map((key) => key.id),
      )
      .groupBy("userId")
      .select("userId as id")
      .select(({ fn }) => fn.count("userId").as("count"))
      .execute();

    return sort(keys, posts).map((result) => Number(result?.count ?? 0));
  };

  const loader = new DataLoader(batchGet, { cacheKeyFn: (key) => key.id });

  return () => {
    return loader;
  };
};
