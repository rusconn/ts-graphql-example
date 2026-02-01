import type { Kysely } from "kysely";

import type { DB, Todo } from "../db/types.ts";
import * as UserTodoLoader from "./loaders/userTodo.ts";
import * as UserTodoCountLoader from "./loaders/userTodoCount.ts";
import * as UserTodosLoader from "./loaders/userTodos.ts";

export class TodoQuery {
  #db;
  #loaders;

  constructor(db: Kysely<DB>) {
    this.#db = db;
    this.#loaders = {
      userTodo: UserTodoLoader.create(db),
      userTodos: UserTodosLoader.create(db),
      userTodoCount: UserTodoCountLoader.create(db),
    };
  }

  async find(id: Todo["id"]) {
    const todo = await this.#db
      .selectFrom("todos")
      .where("id", "=", id)
      .selectAll()
      .executeTakeFirst();

    return todo;
  }

  async count(userId?: Todo["userId"]) {
    const result = await this.#db
      .selectFrom("todos")
      .$if(userId != null, (qb) => qb.where("userId", "=", userId!))
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
