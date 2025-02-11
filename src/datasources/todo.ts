import type { Kysely, Transaction } from "kysely";

import type { DB } from "../db/types.ts";
import type { Todo, TodoKey, TodoNew, TodoUpd } from "../models/todo.ts";
import * as TodoId from "../models/todo/id.ts";
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

  getById = async (id: Todo["id"], trx?: Transaction<DB>) => {
    const user = await (trx ?? this.#db)
      .selectFrom("Todo")
      .where("id", "=", id)
      .selectAll()
      .$if(trx != null, (qb) => qb.forUpdate())
      .executeTakeFirst();

    return user as Todo | undefined;
  };

  count = async (userId?: Todo["userId"]) => {
    const result = await this.#db
      .selectFrom("Todo")
      .$if(userId != null, (qb) => qb.where("userId", "=", userId!))
      .select(({ fn }) => fn.countAll<number>().as("count"))
      .executeTakeFirstOrThrow();

    return result.count;
  };

  create = async (data: TodoNew, trx?: Transaction<DB>) => {
    const { id, date } = TodoId.genWithDate();

    const todo = await (trx ?? this.#db)
      .insertInto("Todo")
      .values({
        id,
        updatedAt: date,
        ...data,
      })
      .returningAll()
      .executeTakeFirst();

    return todo as Todo | undefined;
  };

  update = async ({ id, userId }: TodoKey, data: TodoUpd, trx?: Transaction<DB>) => {
    const todo = await (trx ?? this.#db)
      .updateTable("Todo")
      .where("id", "=", id)
      .$if(userId != null, (qb) => qb.where("userId", "=", userId!))
      .set({
        updatedAt: new Date(),
        ...data,
      })
      .returningAll()
      .executeTakeFirst();

    return todo as Todo | undefined;
  };

  delete = async ({ id, userId }: TodoKey, trx?: Transaction<DB>) => {
    const todo = await (trx ?? this.#db)
      .deleteFrom("Todo")
      .where("id", "=", id)
      .$if(userId != null, (qb) => qb.where("userId", "=", userId!))
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
