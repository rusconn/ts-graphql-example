import type { Kysely } from "kysely";

import type * as Domain from "../../../../domain/models.ts";
import * as Dto from "../../../../graphql/_dto.ts";
import type { DB } from "../../../datasources/_shared/types.ts";
import * as UserTodoLoader from "./loaders/userTodo.ts";
import * as UserTodoCountLoader from "./loaders/userTodoCount.ts";
import * as UserTodosLoader from "./loaders/userTodos.ts";

export class TodoQueryShared {
  #db;
  #loaders;
  #tenantId;

  constructor(db: Kysely<DB>, tenantId?: Domain.Todo.Type["userId"]) {
    this.#db = db;
    this.#loaders = {
      userTodo: UserTodoLoader.create(db, tenantId),
      userTodos: UserTodosLoader.create(db, tenantId),
      userTodoCount: UserTodoCountLoader.create(db, tenantId),
    };
    this.#tenantId = tenantId;
  }

  async find(id: Domain.Todo.Type["id"]) {
    const todo = await this.#db
      .selectFrom("todos")
      .where("id", "=", id)
      .$if(this.#tenantId != null, (qb) => qb.where("userId", "=", this.#tenantId!))
      .selectAll()
      .executeTakeFirst();

    return todo && Dto.Todo.parseOrThrow(todo);
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
    const todo = await this.#loaders.userTodo.load(key);
    return todo && Dto.Todo.parseOrThrow(todo);
  }

  async loadTheirPage(key: UserTodosLoader.Key) {
    const todos = await this.#loaders.userTodos.load(key);
    return todos.map(Dto.Todo.parseOrThrow);
  }

  async loadTheirCount(key: UserTodoCountLoader.Key) {
    return await this.#loaders.userTodoCount.load(key);
  }
}
