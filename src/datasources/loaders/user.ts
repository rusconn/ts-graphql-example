import DataLoader from "dataloader";
import type { Kysely } from "kysely";

import type { DB } from "../../db/types.ts";
import { sort } from "../../lib/dataloader/sort.ts";
import type { User } from "../../models/user.ts";

export type Key = User["id"];

export type Params = Select;

type Select = {
  columns: Set<keyof User>;
};

export const initClosure = (db: Kysely<DB>) => {
  let sharedParams: Params | undefined;

  const batchGet = async (keys: readonly Key[]) => {
    const { columns } = sharedParams!;

    columns.add("id");

    const users = await db //
      .selectFrom("User")
      .where("id", "in", keys)
      .select(columns.values().toArray())
      .execute();

    return sort(keys, users as User[], (user) => user.id);
  };

  const loader = new DataLoader(batchGet);

  return (params: Params) => {
    sharedParams ??= params;
    return loader;
  };
};
