import DataLoader from "dataloader";
import type { Kysely } from "kysely";

import type { DB } from "../../db/types.ts";
import type { Todo, TodoStatus } from "../../domain/todo.ts";
import { sortGroup } from "../../lib/dataloader/sortGroup.ts";
import { mappers } from "../../mappers.ts";

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

  const [direction, comp] = reverse //
    ? (["desc", "<"] as const)
    : (["asc", ">"] as const);

  const cursorSortKey =
    cursor &&
    db //
      .selectFrom("todos")
      .where("id", "=", cursor)
      .select(sortKey);

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
                refTuple(sortKey, "id"), //
                comp,
                tuple(cursorSortKey!, cursor!),
              ),
            ),
          )
          .$if(status != null, (qb) => qb.where("status", "=", mappers.todo.status.toDb(status!)))
          .selectAll("todos")
          .orderBy(sortKey, direction)
          .orderBy("id", direction)
          .limit(limit)
          .as("todos"),
      (join) => join.onTrue(),
    )
    .where("users.id", "in", userIds)
    .selectAll("todos")
    // サブクエリの結果順を維持することを想定して order by は指定していない
    .execute();

  return sortGroup(userIds, todos.map(mappers.todo.toDomain), (todo) => todo.userId);
};
