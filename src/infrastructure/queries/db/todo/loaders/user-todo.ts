import DataLoader from "dataloader";
import type { Kysely } from "kysely";

import type { Key } from "../../../../../application/queries/todo/loaders/user-todo.ts";
import type * as Domain from "../../../../../domain/entities.ts";
import { sort } from "../../../../../lib/dataloader/sort.ts";
import type { DB } from "../../../../datasources/_shared/types.ts";

export type { Key };

export const create = (db: Kysely<DB>, tenantId?: Domain.User.Type["id"]) => {
  return new DataLoader(batchGet(db, tenantId), { cacheKeyFn: combine });
};

const batchGet =
  (db: Kysely<DB>, tenantId?: Domain.Todo.Type["userId"]) => async (keys: readonly Key[]) => {
    const todos = await db
      .selectFrom("todos")
      .where(({ eb, refTuple, tuple }) =>
        eb(
          refTuple("id", "userId"),
          "in",
          keys.map((key) => tuple(key.id, key.userId)),
        ),
      )
      .$if(tenantId != null, (qb) => qb.where("userId", "=", tenantId!))
      .selectAll()
      .execute();

    return sort(keys.map(combine), todos, combine);
  };

const combine = (key: Key) => {
  return key.id + key.userId;
};
