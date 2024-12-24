import DataLoader from "dataloader";
import type { Kysely } from "kysely";

import type { DB } from "../../db/generated/types.ts";
import type { User } from "../../db/models/user.ts";
import { sort } from "../utils/sort.ts";

type Key = Pick<User, "id">;

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

  return sort(keys, users as User[]);
};
