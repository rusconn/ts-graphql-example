import type { ITodoQueryForAdmin } from "../../../../application/queries/todo/for-admin.ts";
import type * as Domain from "../../../../domain/entities.ts";
import type { InMemoryDb } from "../../../datasources/in-memory/store.ts";
import type * as UserTodoLoader from "./loaders/userTodo.ts";
import type * as UserTodoCountLoader from "./loaders/userTodoCount.ts";
import type * as UserTodosLoader from "./loaders/userTodos.ts";
import { TodoQueryShared } from "./shared.ts";

export class TodoQueryForAdmin implements ITodoQueryForAdmin {
  #shared;

  constructor(db: InMemoryDb) {
    this.#shared = new TodoQueryShared(db);
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
