import DataLoader from "dataloader";
import type { Kysely } from "kysely";

import type { Key } from "../../../../../graphql/_queries/todo/loaders/userTodos.ts";
import { sortGroup } from "../../../../../lib/dataloader/sortGroup.ts";
import type { DB, User } from "../../../../datasources/_shared/types.ts";

export type { Key };

export const create = (db: Kysely<DB>, tenantId?: User["id"]) => {
  return new DataLoader(batchGet(db, tenantId), { cacheKeyFn: JSON.stringify });
};

const batchGet = (db: Kysely<DB>, tenantId?: User["id"]) => async (keys: readonly Key[]) => {
  const userIds = keys.map((key) => key.userId);
  const { sortKey, reverse, cursor, limit, status } = keys.at(0)!;

  const [direction, comp] = reverse //
    ? (["desc", "<"] as const)
    : (["asc", ">"] as const);

  const cursorSortKey =
    cursor != null
      ? db
          .selectFrom("todos") //
          .where("id", "=", cursor)
          .select(sortKey)
      : undefined;

  const todos = await db
    .selectFrom("users")
    .innerJoinLateral(
      (eb) =>
        eb
          .selectFrom("todos")
          .whereRef("users.id", "=", "todos.userId")
          .$if(cursor != null, (qb) =>
            qb.where(({ eb, refTuple, tuple }) =>
              eb(refTuple(sortKey, "id"), comp, tuple(cursorSortKey!, cursor!)),
            ),
          )
          .$if(status != null, (qb) => qb.where("status", "=", status!))
          .selectAll("todos")
          .orderBy(sortKey, direction)
          .orderBy("id", direction)
          .limit(limit)
          .as("todos"),
      (join) => join.onTrue(),
    )
    .where("users.id", "in", userIds)
    .$if(tenantId != null, (qb) => qb.where("users.id", "=", tenantId!))
    .selectAll("todos")
    // サブクエリの結果順を維持することを想定して order by は指定していない
    .execute();

  return sortGroup(userIds, todos, (todo) => todo.userId);
};
