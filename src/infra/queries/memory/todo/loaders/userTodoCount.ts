import DataLoader from "dataloader";
import type { Kysely } from "kysely";

import type { Key } from "../../../../../graphql/_queries/todo/loaders/userTodoCount.ts";
import { sort } from "../../../../../lib/dataloader/sort.ts";
import type { DB, Todo, User } from "../../../../datasources/_shared/types.ts";

export type { Key };

export const create = (db: Kysely<DB>, tenantId?: User["id"]) => {
  return new DataLoader(batchGet(db, tenantId), { cacheKeyFn: JSON.stringify });
};

const batchGet = (db: Kysely<DB>, tenantId?: User["id"]) => async (keys: readonly Key[]) => {
  const userIds = keys.map((key) => key.userId);
  const { status } = keys.at(0)!;

  const counts = await db
    .selectFrom("todos")
    .where("userId", "in", userIds)
    .$if(tenantId != null, (qb) => qb.where("userId", "=", tenantId!))
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

  return sort(userIds, counts as Count[], (count) => count.userId, defaultValue) //
    .map(({ count }) => count);
};
