import type { ReadonlyKysely } from "kysely/readonly";

import * as Dto from "../../application/dto.ts";
import type { ITodoQueryForAdmin } from "../../application/queries/todo/for-admin.ts";
import type { ITodoQueryForUser } from "../../application/queries/todo/for-user.ts";
import type {
  CountByUserParams,
  FindByUserParams,
  PageByUserParams,
} from "../../application/queries/todo/params.ts";
import type * as Domain from "../../domain/entities.ts";
import type { DB } from "../datasources/db/types.ts";
import * as UserTodoCountLoader from "./todo/loaders/user-todo-count.ts";
import * as UserTodoLoader from "./todo/loaders/user-todo.ts";
import * as UserTodosLoader from "./todo/loaders/user-todos.ts";

export class TodoQuery implements ITodoQueryForAdmin, ITodoQueryForUser {
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
