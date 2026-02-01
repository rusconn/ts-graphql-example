import DataLoader from "dataloader";
import type { Kysely } from "kysely";

import type { DB, Todo, TodoStatus } from "../../db/types.ts";
import { sort } from "../../lib/dataloader/sort.ts";

export type Key = {
  userId: Todo["userId"];
  status?: TodoStatus;
};

export const create = (db: Kysely<DB>) => {
  return new DataLoader(batchGet(db), { cacheKeyFn: JSON.stringify });
};

const batchGet = (db: Kysely<DB>) => async (keys: readonly Key[]) => {
  const userIds = keys.map((key) => key.userId);
  const { status } = keys.at(0)!;

  const counts = await db
    .selectFrom("todos")
    .where("userId", "in", userIds)
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

  return sort(userIds, counts as Count[], (count) => count.userId, defaultValue).map(
    ({ count }) => count,
  );
};
