import DataLoader from "dataloader";
import type { Kysely } from "kysely";
import type { SetOptional } from "type-fest";

import type { TodoSelect } from "../models.ts";
import type { DB } from "../types.ts";
import { sort } from "./common.ts";

export type Key = SetOptional<Pick<TodoSelect, "id" | "userId">, "userId">;

export const init = (db: Kysely<DB>) => {
  return new DataLoader(batchGet(db), { cacheKeyFn: key => key.id + key.userId });
};

const batchGet = (db: Kysely<DB>) => async (keys: readonly Key[]) => {
  const todos = await db
    .selectFrom("Todo")
    .where(eb =>
      eb.or(
        keys.map(key =>
          key.userId == null
            ? eb("id", "=", key.id)
            : eb.and([eb("id", "=", key.id), eb("userId", "=", key.userId)]),
        ),
      ),
    )
    .selectAll()
    .execute();

  return sort(keys, todos);
};
