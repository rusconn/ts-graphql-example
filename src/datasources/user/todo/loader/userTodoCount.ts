import DataLoader from "dataloader";
import type { Kysely } from "kysely";

import type { DB, TodoStatus } from "../../../../db/generated/types.ts";
import type { Todo } from "../../../../db/models/todo.ts";
import { sort } from "../../../utils/sort.ts";

type Key = Todo["userId"];

export type Params = Filter;

type Filter = {
  status?: TodoStatus;
};

export const initClosure = (db: Kysely<DB>) => {
  let sharedParams: Params | undefined;

  const batchGet = async (keys: readonly Key[]) => {
    const { status } = sharedParams!;

    const counts = await db
      .selectFrom("Todo")
      .where("userId", "in", keys)
      .$if(status != null, (qb) => qb.where("status", "=", status!))
      .groupBy("userId")
      .select("userId")
      .select(({ fn }) => fn.count("userId").as("count"))
      .execute();

    type Count = Pick<Todo, "userId"> & Pick<(typeof counts)[number], "count">;

    return sort(keys, counts as Count[], (count) => count.userId) //
      .map((result) => Number(result?.count ?? 0));
  };

  const loader = new DataLoader(batchGet);

  return (params: Params) => {
    sharedParams ??= params;
    return loader;
  };
};
