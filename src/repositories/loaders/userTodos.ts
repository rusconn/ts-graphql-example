import DataLoader from "dataloader";
import type { Kysely } from "kysely";

import type { DB, TodoStatus } from "../../db/types.ts";
import { sortGroup } from "../../lib/dataloader/sortGroup.ts";
import type { Todo } from "../../models/todo.ts";

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
    .where("User.id", "in", userIds)
    .selectAll("todos")
    // サブクエリの結果順を維持することを想定して order by は指定していない
    .execute();

  return sortGroup(userIds, todos as Todo[], (todo) => todo.userId);
};
