import type { Kysely } from "kysely";

import type { ITodoQueryForAdmin } from "../../../../graphql/_queries/todo/for-admin.ts";
import type { DB, Todo } from "../../../datasources/_shared/types.ts";
import type * as UserTodoLoader from "./loaders/userTodo.ts";
import type * as UserTodoCountLoader from "./loaders/userTodoCount.ts";
import type * as UserTodosLoader from "./loaders/userTodos.ts";
import { TodoQueryShared } from "./shared.ts";

export class TodoQueryForAdmin implements ITodoQueryForAdmin {
  #shared;

  constructor(db: Kysely<DB>) {
    this.#shared = new TodoQueryShared(db);
  }

  async find(id: Todo["id"]) {
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
