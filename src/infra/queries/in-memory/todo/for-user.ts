import type { ITodoQueryForUser } from "../../../../application/queries/todo/for-user.ts";
import type * as Domain from "../../../../domain/entities.ts";
import type { InMemoryDb } from "../../../datasources/in-memory/store.ts";
import type * as UserTodoLoader from "./loaders/userTodo.ts";
import type * as UserTodoCountLoader from "./loaders/userTodoCount.ts";
import type * as UserTodosLoader from "./loaders/userTodos.ts";
import { TodoQueryShared } from "./shared.ts";

export class TodoQueryForUser implements ITodoQueryForUser {
  #shared;

  constructor(db: InMemoryDb, tenantId: Domain.Todo.Type["userId"]) {
    this.#shared = new TodoQueryShared(db, tenantId);
  }

  async find(id: Domain.Todo.Type["id"]) {
    return await this.#shared.find(id);
  }

  async count() {
    return await this.#shared.count();
  }

  async loadTheir(key: UserTodoLoader.Key) {
    return await this.#shared.loadTheir(key);
  }

  async loadTheirPage(key: UserTodosLoader.Key) {
    return await this.#shared.loadTheirPage(key);
  }

  async loadTheirCount(key: UserTodoCountLoader.Key) {
    return await this.#shared.loadTheirCount(key);
  }
}
