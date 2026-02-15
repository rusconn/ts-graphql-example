import type { Todo as Domain } from "../../../../domain/entities.ts";
import { entityNotFoundError } from "../../../../domain/unit-of-works/_errors/entity-not-found.ts";
import type { InMemoryDb } from "../../../datasources/in-memory/store.ts";
import { toDb } from "../../db/_shared/todo.ts";

export class TodoRepoShared {
  #trx;
  #tenantId;

  constructor(trx: InMemoryDb, tenantId?: Domain.Type["userId"]) {
    this.#trx = trx;
    this.#tenantId = tenantId;
  }

  async add(todo: Domain.Type) {
    if (this.#tenantId != null && todo.userId !== this.#tenantId) {
      throw new Error("forbidden");
    }

    const dbTodo = toDb(todo);

    if (this.#trx.todos.has(dbTodo.id)) {
      throw new Error(`conflict: ${dbTodo.id}`);
    } else {
      this.#trx.todos.set(dbTodo.id, dbTodo);
    }
  }

  async update(todo: Domain.Type) {
    const dbTodo = toDb(todo);

    const got = this.#trx.todos.get(dbTodo.id);
    if (!got) {
      throw entityNotFoundError();
    }

    if (this.#tenantId != null && got.userId !== this.#tenantId) {
      throw entityNotFoundError();
    }

    this.#trx.todos.set(dbTodo.id, dbTodo);
  }

  async remove(id: Domain.Type["id"]) {
    const todo = this.#trx.todos.get(id);
    if (!todo) {
      throw entityNotFoundError();
    }

    if (this.#tenantId != null && todo.userId !== this.#tenantId) {
      throw entityNotFoundError();
    }

    this.#trx.todos.delete(id);
  }

  async removeByUserId(userId: Domain.Type["userId"]) {
    const todos = this.#trx.todos
      .entries() //
      .filter(([_, value]) => value.userId === userId);

    if (this.#tenantId != null && userId !== this.#tenantId) {
      return;
    }

    for (const [key, _] of todos) {
      this.#trx.todos.delete(key);
    }
  }
}
