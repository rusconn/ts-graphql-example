import type { Kysely, Transaction } from "kysely";
import type { Except, OverrideProperties } from "type-fest";

import type { DB } from "../db/types.ts";
import * as Domain from "../domain/todo.ts";
import { mappers } from "../mappers.ts";
import * as UserTodoLoader from "./loaders/userTodo.ts";
import * as UserTodoCountLoader from "./loaders/userTodoCount.ts";
import * as UserTodosLoader from "./loaders/userTodos.ts";

type TodoKey = {
  id: Domain.Todo["id"];
  userId?: Domain.Todo["userId"];
};

type TodoNew = OverrideProperties<
  Except<Domain.Todo, "id" | "createdAt" | "updatedAt">, //
  { userId: Domain.Todo["userId"] }
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

  getById = async (id: Domain.Todo["id"], trx?: Transaction<DB>) => {
    const todo = await (trx ?? this.#db)
      .selectFrom("todos")
      .where("id", "=", id)
      .selectAll()
      .$if(trx != null, (qb) => qb.forUpdate())
      .executeTakeFirst();

    return todo && mappers.todo.toDomain(todo);
  };

  count = async (userId?: Domain.Todo["userId"]) => {
    const result = await this.#db
      .selectFrom("todos")
      .$if(userId != null, (qb) => qb.where("userId", "=", userId!))
      .select(({ fn }) => fn.countAll<number>().as("count"))
      .executeTakeFirstOrThrow();

    return result.count;
  };

  create = async ({ status, ...rest }: TodoNew, trx?: Transaction<DB>) => {
    const { id, date } = Domain.TodoId.genWithDate();

    const todo = await (trx ?? this.#db)
      .insertInto("todos")
      .values({
        ...rest,
        id,
        status: mappers.todo.status.toDb(status),
        updatedAt: date,
      })
      .returningAll()
      .executeTakeFirst();

    return todo && mappers.todo.toDomain(todo);
  };

  update = async ({ id, userId }: TodoKey, { status, ...rest }: TodoUpd, trx?: Transaction<DB>) => {
    const todo = await (trx ?? this.#db)
      .updateTable("todos")
      .where("id", "=", id)
      .$if(userId != null, (qb) => qb.where("userId", "=", userId!))
      .set({
        ...rest,
        ...(status && {
          status: mappers.todo.status.toDb(status),
        }),
        updatedAt: new Date(),
      })
      .returningAll()
      .executeTakeFirst();

    return todo && mappers.todo.toDomain(todo);
  };

  delete = async ({ id, userId }: TodoKey, trx?: Transaction<DB>) => {
    const todo = await (trx ?? this.#db)
      .deleteFrom("todos")
      .where("id", "=", id)
      .$if(userId != null, (qb) => qb.where("userId", "=", userId!))
      .returningAll()
      .executeTakeFirst();

    return todo && mappers.todo.toDomain(todo);
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
