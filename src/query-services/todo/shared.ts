import type { Kysely } from "kysely";

import type { DB, Todo, User } from "../../db/types.ts";
import * as UserTodoLoader from "./loaders/userTodo.ts";
import * as UserTodoCountLoader from "./loaders/userTodoCount.ts";
import * as UserTodosLoader from "./loaders/userTodos.ts";

export class TodoQueryShared {
  #db;
  #loaders;
  #tenantId;

  constructor(db: Kysely<DB>, tenantId?: User["id"]) {
    this.#db = db;
    this.#loaders = {
      userTodo: UserTodoLoader.create(db, tenantId),
      userTodos: UserTodosLoader.create(db, tenantId),
      userTodoCount: UserTodoCountLoader.create(db, tenantId),
    };
    this.#tenantId = tenantId;
  }

  async find(id: Todo["id"]) {
    const todo = await this.#db
      .selectFrom("todos")
      .where("id", "=", id)
      .$if(this.#tenantId != null, (qb) => qb.where("userId", "=", this.#tenantId!))
      .selectAll()
      .executeTakeFirst();

    return todo;
  }

  async count() {
    const result = await this.#db
      .selectFrom("todos")
      .$if(this.#tenantId != null, (qb) => qb.where("userId", "=", this.#tenantId!))
      .select(({ fn }) => fn.countAll<number>().as("count"))
      .executeTakeFirst();

    return result?.count ?? 0;
  }

  async loadTheir(key: UserTodoLoader.Key) {
    return await this.#loaders.userTodo.load(key);
  }

  async loadTheirPage(key: UserTodosLoader.Key) {
    return await this.#loaders.userTodos.load(key);
  }

  async loadTheirCount(key: UserTodoCountLoader.Key) {
    return await this.#loaders.userTodoCount.load(key);
  }
}
