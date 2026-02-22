import type { Kysely } from "kysely";

import type { ITodoQueryForAdmin } from "../../../../application/queries/todo/for-admin.ts";
import type * as Domain from "../../../../domain/entities.ts";
import type { DB } from "../../../datasources/_shared/types.ts";
import type * as UserTodoLoader from "./loaders/user-todo.ts";
import type * as UserTodoCountLoader from "./loaders/user-todo-count.ts";
import type * as UserTodosLoader from "./loaders/user-todos.ts";
import { TodoQueryShared } from "./shared.ts";

export class TodoQueryForAdmin implements ITodoQueryForAdmin {
  #db;
  #shared;
  #tenantId;

  constructor(db: Kysely<DB>, tenantId: Domain.Todo.Type["userId"]) {
    this.#db = db;
    this.#shared = new TodoQueryShared(db);
    this.#tenantId = tenantId;
  }

  async find(id: Domain.Todo.Type["id"]) {
    return await this.#shared.find(id);
  }

  async count() {
    const result = await this.#db
      .selectFrom("todos")
      .where("userId", "=", this.#tenantId)
      .select(({ fn }) => fn.countAll<number>().as("count"))
      .executeTakeFirst();

    return result?.count ?? 0;
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
