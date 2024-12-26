import type { Kysely, Transaction } from "kysely";

import type { DB } from "../../db/generated/types.ts";
import type { NewTodo, Todo, UpdTodo } from "../../db/models/todo.ts";
import * as todoId from "../../db/models/todo/id.ts";
import * as userTodoLoader from "./todo/loader/userTodo.ts";
import * as userTodoCountLoader from "./todo/loader/userTodoCount.ts";
import * as userTodosLoader from "./todo/loader/userTodos.ts";

export class UserTodoAPI {
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

  load = async (key: {
    userId: Todo["userId"];
    todoId: Todo["id"];
  }) => {
    return await this.#loaders.userTodo.load({ userId: key.userId, id: key.todoId });
  };

  loadPage = async (
    userId: Todo["userId"],
    params: Omit<userTodosLoader.Params, "orderColumn" | "direction" | "comp"> & {
      sortKey: "createdAt" | "updatedAt";
      reverse: boolean;
    },
  ) => {
    return await this.#loaders.userTodos(params).load(userId);
  };

  loadCount = async (userId: Todo["userId"], params: userTodoCountLoader.Params) => {
    return await this.#loaders.userTodoCount(params).load(userId);
  };

  count = async (userId: Todo["userId"]) => {
    const result = await this.#db
      .selectFrom("Todo")
      .where("userId", "=", userId)
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
      userId: Todo["userId"];
      todoId: Todo["id"];
    },
    data: Omit<UpdTodo, "userId" | "id" | "updatedAt">,
    trx?: Transaction<DB>,
  ) => {
    const todo = await (trx ?? this.#db)
      .updateTable("Todo")
      .where("userId", "=", key.userId)
      .where("id", "=", key.todoId)
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
      userId: Todo["userId"];
      todoId: Todo["id"];
    },
    trx?: Transaction<DB>,
  ) => {
    const todo = await (trx ?? this.#db)
      .deleteFrom("Todo")
      .where("userId", "=", key.userId)
      .where("id", "=", key.todoId)
      .returningAll()
      .executeTakeFirst();

    return todo as Todo | undefined;
  };
}
