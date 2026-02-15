import type { Todo as Domain } from "../../../../domain/entities.ts";
import type { InMemoryDb } from "../../../datasources/in-memory/store.ts";
import { toDomain } from "../../../unit-of-works/db/_shared/todo.ts";

export class TodoRepoShared {
  #db;
  #tenantId;

  constructor(db: InMemoryDb, tenantId?: Domain.Type["userId"]) {
    this.#db = db;
    this.#tenantId = tenantId;
  }

  async find(id: Domain.Type["id"]) {
    const todo = this.#db.todos.get(id);
    if (!todo) {
      return undefined;
    }

    if (this.#tenantId != null && todo.userId !== this.#tenantId) {
      return undefined;
    }

    return todo && toDomain(todo);
  }
}
