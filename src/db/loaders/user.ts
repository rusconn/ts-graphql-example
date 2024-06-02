import DataLoader from "dataloader";
import type { Kysely } from "kysely";

import type { UserSelect } from "../models.ts";
import type { DB } from "../types.ts";
import { sort } from "./common.ts";

export type Key = Pick<UserSelect, "id">;

export const init = (db: Kysely<DB>) => {
  return new DataLoader(batchGet(db), { cacheKeyFn: (key) => key.id });
};

const batchGet = (db: Kysely<DB>) => async (keys: readonly Key[]) => {
  const users = await db
    .selectFrom("User")
    .where(
      "id",
      "in",
      keys.map((key) => key.id),
    )
    .selectAll()
    .execute();

  return sort(keys, users);
};
