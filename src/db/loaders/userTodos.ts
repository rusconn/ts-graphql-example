import DataLoader from "dataloader";
import type { Kysely } from "kysely";
import { groupBy } from "remeda";

import type { TodoSelect, UserSelect } from "../models.ts";
import type { DB } from "../types.ts";

type Key = Pick<UserSelect, "id">;

type Pagination = {
  cursor?: Pick<TodoSelect, "id">;
  limit?: number;
  offset?: number;
  orderColumn: "createdAt" | "updatedAt";
  direction: "asc" | "desc";
  columnComp: ">" | "<";
  idComp: ">=" | "<=";
};

export const initClosure = (db: Kysely<DB>) => {
  let sharedPagination: Pagination | undefined;

  const batchGet = async (keys: readonly Key[]) => {
    const { cursor, limit, offset, orderColumn, direction, columnComp, idComp } = sharedPagination!;

    // biome-ignore format: for readability
    const cursorRecord = cursor
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
        keys.map(key => key.id),
      )
      .$if(cursorRecord != null, qb =>
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
    const userTodos = groupBy(todos, todo => todo.userId);

    const kv = new Map(
      Object.entries(userTodos).map(([key, value]) => [key, value.slice(offset).slice(0, limit)]),
    );

    return keys.map(key => kv.get(key.id) ?? []);
  };

  const loader = new DataLoader(batchGet, { cacheKeyFn: key => key.id });

  return (pagination: Pagination) => {
    sharedPagination ??= pagination;
    return loader;
  };
};
