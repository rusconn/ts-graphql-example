import DataLoader from "dataloader";

import type { Key } from "../../../../../application/queries/todo/loaders/user-todo-count.ts";
import type * as Domain from "../../../../../domain/entities.ts";
import type { InMemoryDb } from "../../../../datasources/in-memory/store.ts";

export type { Key };

export const create = (db: InMemoryDb, tenantId?: Domain.Todo.Type["userId"]) => {
  return new DataLoader(batchGet(db, tenantId), { cacheKeyFn: JSON.stringify });
};

const batchGet =
  (db: InMemoryDb, tenantId?: Domain.Todo.Type["userId"]) => async (keys: readonly Key[]) => {
    const userIds = keys.map((key) => key.userId);
    const { status } = keys.at(0)!;

    const dbTodos = db.todos.values().toArray();

    const counts = userIds.map((userId) => {
      const group = dbTodos.filter((todo) => todo.userId === userId);
      const statusFiltered =
        status != null //
          ? group.filter((todo) => todo.status === status)
          : group;
      const tenantFiltered =
        tenantId != null
          ? statusFiltered.filter((todo) => todo.userId === tenantId)
          : statusFiltered;
      return tenantFiltered.length;
    });

    return counts;
  };
