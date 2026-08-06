import type { ReadonlyKysely } from "kysely/readonly";

import * as Dto from "../../../application/dto.ts";
import type {
  CountByUserParams,
  FindByUserParams,
  PageByUserParams,
} from "../../../application/queries/todo/params.ts";
import type * as Domain from "../../../domain/entities.ts";
import type { DB } from "../../datasources/db/types.ts";
import * as UserTodoCountLoader from "./loaders/user-todo-count.ts";
import * as UserTodoLoader from "./loaders/user-todo.ts";
import * as UserTodosLoader from "./loaders/user-todos.ts";

export class TodoQueryShared {
  #db;
  #loaders;
  #tenantId;

  constructor(db: ReadonlyKysely<DB>, tenantId?: Domain.Todo.Type["userId"]) {
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

  async findByUser(params: FindByUserParams) {
    const todo = await this.#loaders.userTodo.load(params);
    return todo && Dto.Todo.parseOrThrow(todo);
  }

  async pageByUser(params: PageByUserParams) {
    const todos = await this.#loaders.userTodos.load(params);
    return todos.map(Dto.Todo.parseOrThrow);
  }

  async countByUser(params: CountByUserParams) {
    return await this.#loaders.userTodoCount.load(params);
  }
}
