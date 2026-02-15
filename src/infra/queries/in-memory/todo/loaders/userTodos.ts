import DataLoader from "dataloader";

import type { Key } from "../../../../../application/queries/todo/loaders/user-todos.ts";
import type * as Domain from "../../../../../domain/entities.ts";
import type { InMemoryDb } from "../../../../datasources/in-memory/store.ts";

export type { Key };

export const create = (db: InMemoryDb, tenantId?: Domain.User.Type["id"]) => {
  return new DataLoader(batchGet(db, tenantId), { cacheKeyFn: JSON.stringify });
};

const batchGet =
  (db: InMemoryDb, tenantId?: Domain.User.Type["id"]) => async (keys: readonly Key[]) => {
    const userIds = keys.map((key) => key.userId);
    const { sortKey, reverse, cursor, limit, status } = keys.at(0)!;

    const cursorSortKey =
      cursor != null
        ? db.todos.get(cursor)![sortKey] //
        : undefined;

    const dbTodos = db.todos.values().toArray();

    const dbTodosSorted = dbTodos.sort((a, b) => {
      const [x, y] = reverse ? [b, a] : [a, b];
      return x[sortKey].getTime() - y[sortKey].getTime();
    });

    return userIds.map((userId) => {
      const todos = dbTodosSorted.filter((todo) => todo.userId === userId);

      const tenantFiltered =
        tenantId != null
          ? todos.filter((todo) => todo.userId === tenantId) //
          : todos;

      const cursored =
        cursorSortKey != null
          ? (() =>
              tenantFiltered.filter((todo) =>
                reverse
                  ? todo[sortKey] < cursorSortKey //
                  : todo[sortKey] > cursorSortKey,
              ))()
          : tenantFiltered;

      const statusFiltered =
        status != null
          ? cursored.filter((todo) => todo.status === status) //
          : cursored;

      return statusFiltered.slice(0, limit);
    });
  };
