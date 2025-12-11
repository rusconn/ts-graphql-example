import DataLoader from "dataloader";
import type { Kysely } from "kysely";

import type { DB } from "../../db/types.ts";
import { sortGroup } from "../../lib/dataloader/sortGroup.ts";
import type { Todo, TodoStatus } from "../../models/todo.ts";

export type Key = {
  userId: Todo["userId"];
  sortKey: "createdAt" | "updatedAt";
  reverse: boolean;
  cursor?: Todo["id"];
  limit: number;
  status?: TodoStatus;
};

export const create = (db: Kysely<DB>) => {
  return new DataLoader(batchGet(db), { cacheKeyFn: JSON.stringify });
};

const batchGet = (db: Kysely<DB>) => async (keys: readonly Key[]) => {
  const userIds = keys.map((key) => key.userId);
  const { sortKey, reverse, cursor, limit, status } = keys.at(0)!;

  const orderColumn = sortKey === "createdAt" ? "id" : sortKey;

  const [direction, comp] = reverse //
    ? (["desc", "<"] as const)
    : (["asc", ">"] as const);

  const cursorOrderColumn =
    cursor &&
    db //
      .selectFrom("todos")
      .where("id", "=", cursor)
      .select(orderColumn);

  const todos = await db
    .selectFrom("users")
    .innerJoinLateral(
      (eb) =>
        eb
          .selectFrom("todos")
          .whereRef("users.id", "=", "todos.userId")
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
          .selectAll("todos")
          .orderBy(orderColumn, direction)
          .orderBy("id", direction)
          .limit(limit)
          .as("todos"),
      (join) => join.onTrue(),
    )
    .where("users.id", "in", userIds)
    .selectAll("todos")
    // サブクエリの結果順を維持することを想定して order by は指定していない
    .execute();

  return sortGroup(userIds, todos as Todo[], (todo) => todo.userId);
};
