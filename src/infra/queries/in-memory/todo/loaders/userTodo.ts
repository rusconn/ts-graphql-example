import DataLoader from "dataloader";

import type { Key } from "../../../../../application/queries/todo/loaders/user-todo.ts";
import type * as Domain from "../../../../../domain/entities.ts";
import type { InMemoryDb } from "../../../../datasources/in-memory/store.ts";

export type { Key };

export const create = (db: InMemoryDb, tenantId?: Domain.User.Type["id"]) => {
  return new DataLoader(batchGet(db, tenantId), { cacheKeyFn: combine });
};

const batchGet =
  (db: InMemoryDb, tenantId?: Domain.Todo.Type["userId"]) => async (keys: readonly Key[]) => {
    const todos = keys.map((key) => {
      const todo = db.todos.get(key.id);
      if (!todo) {
        return undefined;
      }

      if (todo.userId !== key.userId) {
        return undefined;
      }

      if (tenantId != null && todo.userId !== tenantId) {
        return undefined;
      }

      return todo;
    });

    return todos;
  };

const combine = (key: Key) => {
  return key.id + key.userId;
};
