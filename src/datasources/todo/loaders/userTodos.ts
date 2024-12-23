import DataLoader from "dataloader";
import type { Kysely } from "kysely";

import type { TodoSelect, UserSelect } from "../../../db/models.ts";
import type { DB, TodoStatus } from "../../../db/types.ts";

type Key = Pick<UserSelect, "id">;

type Params = Pagination & Filter;

type Pagination = {
  cursor?: Pick<TodoSelect, "id">;
  limit: number;
  sortKey: "createdAt" | "updatedAt";
  reverse: boolean;
};

type Filter = {
  status?: TodoStatus;
};

export const initClosure = (db: Kysely<DB>) => {
  let sharedParams: Params | undefined;

  const batchGet = async (keys: readonly Key[]) => {
    const { cursor, limit, sortKey, reverse, status } = sharedParams!;

    const orderKey = sortKey === "createdAt" ? "id" : sortKey;

    const [direction, comp] = reverse //
      ? (["desc", "<"] as const)
      : (["asc", ">"] as const);

    const cursorOrderKey =
      cursor &&
      db //
        .selectFrom("Todo")
        .where("id", "=", cursor.id)
        .select(orderKey);

    // 本当は各 key に対する select limit を union したいが、
    // kysely がサポートしていないようなので、全件取得した後オンメモリでそれぞれ limit する
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
      .$if(cursorOrderKey != null, (qb) =>
        qb.where(({ eb }) =>
          eb.or([
            eb(orderKey, comp, cursorOrderKey!),
            eb.and([
              //
              eb(orderKey, "=", cursorOrderKey!),
              eb("id", comp, cursor!.id),
            ]),
          ]),
        ),
      )
      .selectAll()
      .orderBy(orderKey, direction)
      .orderBy("id", direction)
      .execute();

    // 順序は維持してくれるみたい
    const userTodos = Map.groupBy(todos, (todo) => todo.userId);

    const kv = new Map(userTodos.entries().map(([key, value]) => [key, value.slice(0, limit)]));

    return keys.map((key) => kv.get(key.id) ?? []);
  };

  const loader = new DataLoader(batchGet, { cacheKeyFn: (key) => key.id });

  return (params: Params) => {
    sharedParams ??= params;
    return loader;
  };
};
