import DataLoader from "dataloader";
import type { ReadonlyKysely } from "kysely/readonly";

import type * as Domain from "../../../../domain/entities.ts";
import { sort } from "../../../../lib/dataloader/sort.ts";
import type { Uuidv7 } from "../../../../util/uuid/v7.ts";
import type { DB } from "../../../datasources/db/types.ts";

type Key = Uuidv7;

export function create(db: ReadonlyKysely<DB>, tenantId?: Domain.User.Type["id"]) {
  return new DataLoader(batchGet(db, tenantId));
}

const batchGet =
  (db: ReadonlyKysely<DB>, tenantId?: Domain.User.Type["id"]) => async (keys: readonly Key[]) => {
    const users = await db //
      .selectFrom("users")
      .where("id", "in", keys)
      .$if(tenantId != null, (qb) => qb.where("id", "=", tenantId!))
      .selectAll()
      .execute();

    return sort(keys, users, (user) => user.id);
  };
