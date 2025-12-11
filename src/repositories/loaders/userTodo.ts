import DataLoader from "dataloader";
import type { Kysely } from "kysely";

import type { DB } from "../../db/types.ts";
import type { Todo } from "../../domain/todo.ts";
import { sort } from "../../lib/dataloader/sort.ts";
import { mappers } from "../../mappers.ts";

export type Key = Pick<Todo, "id" | "userId">;

export const create = (db: Kysely<DB>) => {
  return new DataLoader(batchGet(db), { cacheKeyFn: combine });
};

const batchGet = (db: Kysely<DB>) => async (keys: readonly Key[]) => {
  const todos = await db
    .selectFrom("todos")
    .where(({ eb, refTuple, tuple }) =>
      eb(
        refTuple("id", "userId"),
        "in",
        keys.map((key) => tuple(key.id, key.userId)),
      ),
    )
    .selectAll()
    .execute();

  return sort(keys.map(combine), todos.map(mappers.todo.toDomain), combine);
};

const combine = (key: Key) => {
  return key.id + key.userId;
};
