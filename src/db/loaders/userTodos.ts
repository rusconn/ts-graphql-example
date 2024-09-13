import DataLoader from "dataloader";
import type { Kysely } from "kysely";

import type { TodoSelect, UserSelect } from "../models.ts";
import type { DB, TodoStatus } from "../types.ts";

type Key = Pick<UserSelect, "id">;

type Params = Filter & Pagination;

type Filter = {
  status?: TodoStatus;
};

type Pagination = {
  cursor?: Pick<TodoSelect, "id">;
  limit?: number;
  offset?: number;
  orderColumn: "id" | "updatedAt";
  direction: "asc" | "desc";
  columnComp: ">" | "<";
  idComp: ">=" | "<=";
};

export const initClosure = (db: Kysely<DB>) => {
  let sharedParams: Params | undefined;

  const batchGet = async (keys: readonly Key[]) => {
    const { status, cursor, limit, offset, orderColumn, direction, columnComp, idComp } =
      sharedParams!;

    const cursorRecord = cursor //
      ? db.selectFrom("Todo").where("id", "=", cursor.id)
      : undefined;

    // 本当は各 key に対する select limit offset を union したいが、
    // kysely がサポートしていないようなので、全件取得した後オンメモリでそれぞれ limit offset する
    // この方法には結果セットが必要以上に大きくなり得るという問題がある
    // 即死も有り得る😱
    const todos = await db
      .selectFrom("Todo")
      .where(
        "userId",
        "in",
        keys.map((key) => key.id),
      )
      .$if(status != null, (qb) => qb.where("status", "=", status!))
      .$if(cursorRecord != null, (qb) =>
        qb.where(({ eb }) =>
          eb.or([
            eb(orderColumn, columnComp, cursorRecord!.select(orderColumn)),
            eb.and([
              eb(orderColumn, "=", cursorRecord!.select(orderColumn)),
              eb("id", idComp, cursorRecord!.select("id")),
            ]),
          ]),
        ),
      )
      .orderBy(orderColumn, direction)
      .orderBy("id", direction)
      .selectAll()
      .execute();

    // 順序は維持してくれるみたい
    const userTodos = Map.groupBy(todos, (todo) => todo.userId);

    const kv = new Map(
      userTodos.entries().map(([key, value]) => [key, value.slice(offset).slice(0, limit)]),
    );

    return keys.map((key) => kv.get(key.id) ?? []);
  };

  const loader = new DataLoader(batchGet, { cacheKeyFn: (key) => key.id });

  return (params: Params) => {
    sharedParams ??= params;
    return loader;
  };
};
