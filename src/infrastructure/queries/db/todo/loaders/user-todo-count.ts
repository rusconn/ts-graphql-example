import DataLoader from "dataloader";
import type { ReadonlyKysely } from "kysely/readonly";

import type { Key } from "../../../../../application/queries/todo/loaders/user-todo-count.ts";
import type * as Domain from "../../../../../domain/entities.ts";
import { sort } from "../../../../../lib/dataloader/sort.ts";
import type { DB, Todo } from "../../../../datasources/_shared/types.ts";

export type { Key };

export function create(db: ReadonlyKysely<DB>, tenantId?: Domain.Todo.Type["userId"]) {
  return new DataLoader(batchGet(db, tenantId), { cacheKeyFn: JSON.stringify });
}

const batchGet =
  (db: ReadonlyKysely<DB>, tenantId?: Domain.Todo.Type["userId"]) =>
  async (keys: readonly Key[]) => {
    const userIds = keys.map((key) => key.userId);
    const { status, search } = keys.at(0)!;

    const counts = await db
      .selectFrom("todos")
      .where("userId", "in", userIds)
      .$if(tenantId != null, (qb) => qb.where("userId", "=", tenantId!))
      .$if(status != null, (qb) => qb.where("status", "=", status!))
      .$if(search != null, (qb) =>
        qb.where((eb) =>
          eb.or([
            eb("title", "ilike", `%${search!}%`), //
            eb("description", "ilike", `%${search!}%`),
          ]),
        ),
      )
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
