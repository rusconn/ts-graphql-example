import DataLoader from "dataloader";
import type { Kysely } from "kysely";

import type { Key } from "../../../../../application/queries/user/loaders/user.ts";
import type * as Domain from "../../../../../domain/entities.ts";
import { sort } from "../../../../../lib/dataloader/sort.ts";
import type { DB } from "../../../../datasources/_shared/types.ts";

export type { Key };

export const create = (db: Kysely<DB>, tenantId?: Domain.User.Type["id"]) => {
  return new DataLoader(batchGet(db, tenantId));
};

const batchGet =
  (db: Kysely<DB>, tenantId?: Domain.User.Type["id"]) => async (keys: readonly Key[]) => {
    const users = await db //
      .selectFrom("users")
      .where("id", "in", keys)
      .$if(tenantId != null, (qb) => qb.where("id", "=", tenantId!))
      .selectAll()
      .execute();

    return sort(keys, users, (user) => user.id);
  };
