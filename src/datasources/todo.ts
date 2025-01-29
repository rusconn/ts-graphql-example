import type { Kysely, Transaction } from "kysely";

import type { DB } from "../db/generated/types.ts";
import type { NewTodo, Todo, UpdTodo } from "../db/models/todo.ts";
import * as todoId from "../db/models/todo/id.ts";
import * as userTodoLoader from "./loaders/userTodo.ts";
import * as userTodoCountLoader from "./loaders/userTodoCount.ts";
import * as userTodosLoader from "./loaders/userTodos.ts";

export class TodoAPI {
  #db;
  #loaders;

  constructor(db: Kysely<DB>) {
    this.#db = db;
    this.#loaders = {
      userTodo: userTodoLoader.init(db),
      userTodos: userTodosLoader.initClosure(db),
      userTodoCount: userTodoCountLoader.initClosure(db),
    };
  }

  count = async (userId?: Todo["userId"]) => {
    const result = await this.#db
      .selectFrom("Todo")
      .$if(userId != null, (qb) => qb.where("userId", "=", userId!))
      .select(({ fn }) => fn.countAll().as("count"))
      .executeTakeFirstOrThrow();

    return Number(result.count);
  };

  create = async (
    userId: Todo["userId"],
    data: Omit<NewTodo, "userId" | "id" | "updatedAt">,
    trx?: Transaction<DB>,
  ) => {
    const { id, date } = todoId.genWithDate();

    const todo = await (trx ?? this.#db)
      .insertInto("Todo")
      .values({
        id,
        updatedAt: date,
        ...data,
        userId,
      })
      .returningAll()
      .executeTakeFirst();

    return todo as Todo | undefined;
  };

  update = async (
    key: {
      id: Todo["id"];
      userId?: Todo["userId"];
    },
    data: Omit<UpdTodo, "userId" | "id" | "updatedAt">,
    trx?: Transaction<DB>,
  ) => {
    const todo = await (trx ?? this.#db)
      .updateTable("Todo")
      .where("id", "=", key.id)
      .$if(key.userId != null, (qb) => qb.where("userId", "=", key.userId!))
      .set({
        updatedAt: new Date(),
        ...data,
      })
      .returningAll()
      .executeTakeFirst();

    return todo as Todo | undefined;
  };

  delete = async (
    key: {
      id: Todo["id"];
      userId?: Todo["userId"];
    },
    trx?: Transaction<DB>,
  ) => {
    const todo = await (trx ?? this.#db)
      .deleteFrom("Todo")
      .where("id", "=", key.id)
      .$if(key.userId != null, (qb) => qb.where("userId", "=", key.userId!))
      .returningAll()
      .executeTakeFirst();

    return todo as Todo | undefined;
  };

  loadTheir = async (key: userTodoLoader.Key) => {
    return await this.#loaders.userTodo.load(key);
  };

  loadTheirPage = async (key: userTodosLoader.Key, params: userTodosLoader.Params) => {
    return await this.#loaders.userTodos(params).load(key);
  };

  loadTheirCount = async (key: userTodoCountLoader.Key, params: userTodoCountLoader.Params) => {
    return await this.#loaders.userTodoCount(params).load(key);
  };
}
