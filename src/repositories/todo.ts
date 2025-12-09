import type { Kysely, Transaction } from "kysely";
import type { Except, OverrideProperties } from "type-fest";

import type { DB } from "../db/types.ts";
import { type Todo, TodoId } from "../models/todo.ts";
import * as UserTodoLoader from "./loaders/userTodo.ts";
import * as UserTodoCountLoader from "./loaders/userTodoCount.ts";
import * as UserTodosLoader from "./loaders/userTodos.ts";

type TodoKey = {
  id: Todo["id"];
  userId?: Todo["userId"];
};

type TodoNew = OverrideProperties<
  Except<Todo, "id" | "updatedAt">, //
  { userId: Todo["userId"] }
>;

type TodoUpd = Partial<TodoNew>;

export class TodoRepo {
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

  getById = async (id: Todo["id"], trx?: Transaction<DB>) => {
    const todo = await (trx ?? this.#db)
      .selectFrom("Todo")
      .where("id", "=", id)
      .selectAll()
      .$if(trx != null, (qb) => qb.forUpdate())
      .executeTakeFirst();

    return todo as Todo | undefined;
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

  loadTheir = async (key: UserTodoLoader.Key) => {
    return await this.#loaders.userTodo.load(key);
  };

  loadTheirPage = async (key: UserTodosLoader.Key) => {
    return await this.#loaders.userTodos.load(key);
  };

  loadTheirCount = async (key: UserTodoCountLoader.Key) => {
    return await this.#loaders.userTodoCount.load(key);
  };
}
