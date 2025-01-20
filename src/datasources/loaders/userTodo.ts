import DataLoader from "dataloader";
import type { Kysely } from "kysely";

import type { DB } from "../../db/generated/types.ts";
import type { Todo } from "../../db/models/todo.ts";
import { sort } from "../../lib/dataloader/sort.ts";

type Key = Pick<Todo, "id" | "userId">;

export const init = (db: Kysely<DB>) => {
  return new DataLoader(batchGet(db), { cacheKeyFn: combine });
};

const batchGet = (db: Kysely<DB>) => async (keys: readonly Key[]) => {
  const todos = await db
    .selectFrom("Todo")
    .where(({ eb, refTuple, tuple }) =>
      eb(
        refTuple("id", "userId"),
        "in",
        keys.map((key) => tuple(key.id, key.userId)),
      ),
    )
    .selectAll()
    .execute();

  return sort(keys.map(combine), todos as Todo[], combine);
};

const combine = (key: Key) => {
  return key.id + key.userId;
};
