import DataLoader from "dataloader";
import type { Kysely } from "kysely";

import type { DB } from "../../db/generated/types.ts";
import type { User } from "../../db/models/user.ts";
import { sort } from "../../lib/dataloader/sort.ts";

export type Key = User["id"];

export const init = (db: Kysely<DB>) => {
  return new DataLoader(batchGet(db));
};

const batchGet = (db: Kysely<DB>) => async (keys: readonly Key[]) => {
  const users = await db //
    .selectFrom("User")
    .where("id", "in", keys)
    .selectAll()
    .execute();

  return sort(keys, users as User[], (user) => user.id);
};
