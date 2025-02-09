import DataLoader from "dataloader";
import type { Kysely } from "kysely";

import type { DB } from "../../db/types.ts";
import { sort } from "../../lib/dataloader/sort.ts";
import type { Todo } from "../../models/todo.ts";

export type Key = Pick<Todo, "id" | "userId">;

export type Params = Select;

type Select = {
  columns: Set<keyof Todo>;
};

export const initClosure = (db: Kysely<DB>) => {
  let sharedParams: Params | undefined;

  const batchGet = async (keys: readonly Key[]) => {
    const { columns } = sharedParams!;

    columns.add("id").add("userId");

    const todos = await db
      .selectFrom("Todo")
      .where(({ eb, refTuple, tuple }) =>
        eb(
          refTuple("id", "userId"),
          "in",
          keys.map((key) => tuple(key.id, key.userId)),
        ),
      )
      .select(columns.values().toArray())
      .execute();

    return sort(keys.map(combine), todos as Todo[], combine);
  };

  const loader = new DataLoader(batchGet);

  return (params: Params) => {
    sharedParams ??= params;
    return loader;
  };
};

const combine = (key: Key) => {
  return key.id + key.userId;
};
