import type { Kysely } from "kysely";

import type { DB } from "../../../datasources/_shared/types.ts";
import type { ITodoQueryForUser } from "../../../../graphql/_queries/todo/for-user.ts";
import type * as UserTodoLoader from "./loaders/userTodo.ts";
import type * as UserTodoCountLoader from "./loaders/userTodoCount.ts";
import type * as UserTodosLoader from "./loaders/userTodos.ts";
import { TodoQueryShared } from "./shared.ts";
import type * as Domain from "../../../../domain/models.ts";

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
