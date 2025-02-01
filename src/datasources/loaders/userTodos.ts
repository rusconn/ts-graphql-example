import DataLoader from "dataloader";
import type { Kysely } from "kysely";

import type { DB, TodoStatus } from "../../db/generated/types.ts";
import type { Todo } from "../../db/models/todo.ts";

export type Key = Todo["userId"];

export type Params = Filter & Pagination;

type Filter = {
  status?: TodoStatus;
};

type Pagination = {
  cursor?: Todo["id"];
  sortKey: "createdAt" | "updatedAt";
  limit: number;
  reverse: boolean;
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

    // 本当は各 key に対する select limit を union all したいが、
    // kysely が集合演算を正しく実装していないようなので別の方法で実現した。
    // クエリの効率は悪いが、全件取得後にオンメモリで limit するよりマシ。
    const todos = await db
      .with("results", (db) =>
        db
          .selectFrom("Todo")
          .where("userId", "in", keys)
          .$if(status != null, (qb) => qb.where("status", "=", status!))
          .$if(cursor != null, (qb) =>
            qb.where(({ eb, refTuple, tuple }) =>
              eb(
                refTuple(orderColumn, "id"), //
                comp,
                tuple(cursorOrderColumn!, cursor!),
              ),
            ),
          )
          .selectAll()
          .select(({ fn }) =>
            fn
              .agg<number>("row_number")
              .over((ob) =>
                ob //
                  .partitionBy("userId")
                  .orderBy(orderColumn, direction)
                  .orderBy("id", direction),
              )
              .as("nth"),
          ),
      )
      .selectFrom("results")
      .where("nth", "<=", limit)
      .select([
        "id", //
        "updatedAt",
        "title",
        "description",
        "status",
        "userId",
      ])
      .orderBy("nth", "asc")
      .execute();

    // 順序は維持してくれるみたい
    const userTodos = Map.groupBy(todos as Todo[], (todo) => todo.userId);

    return keys.map((key) => userTodos.get(key) ?? []);
  };

  const loader = new DataLoader(batchGet);

  return (params: Params) => {
    sharedParams ??= params;
    return loader;
  };
};
