import DataLoader from "dataloader";
import type { Kysely } from "kysely";

import type { UserSelect } from "../models.ts";
import type { DB, TodoStatus } from "../types.ts";
import { sort } from "./common.ts";

export type Key = Pick<UserSelect, "id">;

type Params = Filter;

type Filter = {
  status?: TodoStatus;
};

export const initClosure = (db: Kysely<DB>) => {
  let sharedParams: Params | undefined;

  const batchGet = async (keys: readonly Key[]) => {
    const { status } = sharedParams!;

    const todos = await db
      .selectFrom("Todo")
      .where(
        "userId",
        "in",
        keys.map((key) => key.id),
      )
      .$if(status != null, (qb) => qb.where("status", "=", status!))
      .groupBy("userId")
      .select("userId as id")
      .select(({ fn }) => fn.count("userId").as("count"))
      .execute();

    return sort(keys, todos).map((result) => Number(result?.count ?? 0));
  };

  const loader = new DataLoader(batchGet, { cacheKeyFn: (key) => key.id });

  return (params: Params) => {
    sharedParams ??= params;
    return loader;
  };
};
