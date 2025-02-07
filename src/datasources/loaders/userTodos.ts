import DataLoader from "dataloader";
import type { Kysely } from "kysely";

import type { DB, TodoStatus } from "../../db/generated/types.ts";
import type { Todo } from "../../db/models/todo.ts";
import { sortGroup } from "../../lib/dataloader/sortGroup.ts";

export type Key = Todo["userId"];

export type Params = Pagination & Filter;

type Pagination = {
  sortKey: "createdAt" | "updatedAt";
  reverse: boolean;
  cursor?: Todo["id"];
  limit: number;
};

type Filter = {
  status?: TodoStatus;
};

export const initClosure = (db: Kysely<DB>) => {
  let sharedParams: Params | undefined;

  const batchGet = async (keys: readonly Key[]) => {
    const { status, cursor, sortKey, limit, reverse } = sharedParams!;

    const orderColumn = sortKey === "createdAt" ? "id" : sortKey;

    const [direction, comp] = reverse //
      ? (["desc", "<"] as const)
      : (["asc", ">"] as const);

    const cursorOrderColumn =
      cursor &&
      db //
        .selectFrom("Todo")
        .where("id", "=", cursor)
        .select(orderColumn);

    const todos = await db
      .selectFrom("User")
      .innerJoinLateral(
        (eb) =>
          eb
            .selectFrom("Todo")
            .whereRef("User.id", "=", "Todo.userId")
            .$if(cursor != null, (qb) =>
              qb.where(({ eb, refTuple, tuple }) =>
                eb(
                  refTuple(orderColumn, "id"), //
                  comp,
                  tuple(cursorOrderColumn!, cursor!),
                ),
              ),
            )
            .$if(status != null, (qb) => qb.where("status", "=", status!))
            .selectAll("Todo")
            .orderBy(orderColumn, direction)
            .orderBy("id", direction)
            .limit(limit)
            .as("todos"),
        (join) => join.onTrue(),
      )
      .where("User.id", "in", keys)
      .selectAll("todos")
      // サブクエリの結果順を維持することを想定して order by は指定していない
      .execute();

    return sortGroup(keys, todos as Todo[], (todo) => todo.userId);
  };

  const loader = new DataLoader(batchGet);

  return (params: Params) => {
    sharedParams ??= params;
    return loader;
  };
};
