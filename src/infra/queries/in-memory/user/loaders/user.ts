import DataLoader from "dataloader";

import type { Key } from "../../../../../application/queries/user/loaders/user.ts";
import type * as Domain from "../../../../../domain/entities.ts";
import type { InMemoryDb } from "../../../../datasources/in-memory/store.ts";

export type { Key };

export const create = (db: InMemoryDb, tenantId?: Domain.User.Type["id"]) => {
  return new DataLoader(batchGet(db, tenantId));
};

const batchGet =
  (db: InMemoryDb, tenantId?: Domain.User.Type["id"]) => async (keys: readonly Key[]) => {
    return keys.map((key) => {
      const user = db.users.get(key);
      if (!user) {
        return undefined;
      }

      if (tenantId != null && user.id !== tenantId) {
        return undefined;
      }

      return user;
    });
  };
