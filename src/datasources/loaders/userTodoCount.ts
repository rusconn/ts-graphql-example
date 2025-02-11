import DataLoader from "dataloader";
import type { Kysely } from "kysely";

import type { DB, TodoStatus } from "../../db/types.ts";
import { sort } from "../../lib/dataloader/sort.ts";
import type { Todo } from "../../models/todo.ts";

export type Key = Todo["userId"];

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
      .select(({ fn }) => fn.count<number>("userId").as("count"))
      .execute();

    type Count = {
      userId: Todo["userId"];
      count: number;
    };

    const defaultValue = {
      userId: "",
      count: 0,
    } as Count;

    return sort(keys, counts as Count[], (count) => count.userId, defaultValue).map(
      ({ count }) => count,
    );
  };

  const loader = new DataLoader(batchGet);

  return (params: Params) => {
    sharedParams ??= params;
    return loader;
  };
};
