import DataLoader from "dataloader";
import type { Kysely } from "kysely";

import type { DB, User } from "../../../db/types.ts";
import { sort } from "../../../lib/dataloader/sort.ts";

export type Key = User["id"];

export const create = (db: Kysely<DB>, tenantId?: User["id"]) => {
  return new DataLoader(batchGet(db, tenantId));
};

const batchGet = (db: Kysely<DB>, tenantId?: User["id"]) => async (keys: readonly Key[]) => {
  const users = await db //
    .selectFrom("users")
    .where("id", "in", keys)
    .$if(tenantId != null, (qb) => qb.where("id", "=", tenantId!))
    .selectAll()
    .execute();

  return sort(keys, users, (user) => user.id);
};
