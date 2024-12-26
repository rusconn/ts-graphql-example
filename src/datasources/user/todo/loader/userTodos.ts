import DataLoader from "dataloader";
import type { Kysely } from "kysely";

import type { DB, TodoStatus } from "../../../../db/generated/types.ts";
import type { Todo } from "../../../../db/models/todo.ts";

type Key = Todo["userId"];

export type Params = Filter & Pagination;

type Filter = {
  status?: TodoStatus;
};

type Pagination = {
  cursor?: Pick<Todo, "id">;
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
        .where("id", "=", cursor.id)
        .select(orderColumn);

    // 本当は各 key に対する select limit を union したいが、
    // kysely がサポートしていないようなので、全件取得した後オンメモリでそれぞれ limit する
    // この方法には結果セットが必要以上に大きくなり得るという問題がある
    // 即死も有り得る😱
    const todos = await db
      .selectFrom("Todo")
      .where("userId", "in", keys)
      .$if(status != null, (qb) => qb.where("status", "=", status!))
      .$if(cursorOrderColumn != null, (qb) =>
        qb.where(({ eb }) =>
          eb.or([
            eb(orderColumn, comp, cursorOrderColumn!),
            eb.and([
              //
              eb(orderColumn, "=", cursorOrderColumn!),
              eb("id", comp, cursor!.id),
            ]),
          ]),
        ),
      )
      .selectAll()
      .orderBy(orderColumn, direction)
      .orderBy("id", direction)
      .execute();

    // 順序は維持してくれるみたい
    const userTodos = Map.groupBy(todos as Todo[], (todo) => todo.userId);

    const kv = new Map(userTodos.entries().map(([key, value]) => [key, value.slice(0, limit)]));

    return keys.map((key) => kv.get(key) ?? []);
  };

  const loader = new DataLoader(batchGet);

  return (params: Params) => {
    sharedParams ??= params;
    return loader;
  };
};
