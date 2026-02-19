import type { Kysely } from "kysely";

import type { ITodoQueryForUser } from "../../../../application/queries/todo/for-user.ts";
import type * as Domain from "../../../../domain/entities.ts";
import type { DB } from "../../../datasources/_shared/types.ts";
import type * as UserTodoLoader from "./loaders/user-todo.ts";
import type * as UserTodoCountLoader from "./loaders/user-todo-count.ts";
import type * as UserTodosLoader from "./loaders/user-todos.ts";
import { TodoQueryShared } from "./shared.ts";

export class TodoQueryForUser implements ITodoQueryForUser {
  #shared;

  constructor(db: Kysely<DB>, tenantId: Domain.Todo.Type["userId"]) {
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
