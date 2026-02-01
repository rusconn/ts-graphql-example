import DataLoader from "dataloader";
import type { Kysely } from "kysely";

import type { DB, User } from "../../db/types.ts";
import { sort } from "../../lib/dataloader/sort.ts";

export type Key = User["id"];

export const create = (db: Kysely<DB>) => {
  return new DataLoader(batchGet(db));
};

const batchGet = (db: Kysely<DB>) => async (keys: readonly Key[]) => {
  const users = await db //
    .selectFrom("users")
    .where("id", "in", keys)
    .selectAll()
    .execute();

  return sort(keys, users, (user) => user.id);
};
