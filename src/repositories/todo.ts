import type { Kysely, Transaction } from "kysely";

import type { DB } from "../db/types.ts";
import type * as Domain from "../domain/todo.ts";
import { mappers } from "../mappers.ts";
import * as UserTodoLoader from "./loaders/userTodo.ts";
import * as UserTodoCountLoader from "./loaders/userTodoCount.ts";
import * as UserTodosLoader from "./loaders/userTodos.ts";

type TodoKey = {
  id: Domain.Todo["id"];
  userId?: Domain.Todo["userId"];
};

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

  find = async (id: Domain.Todo["id"], trx?: Transaction<DB>) => {
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
      .executeTakeFirst();

    return result?.count ?? 0;
  };

  save = async (todo: Domain.Todo, trx?: Transaction<DB>) => {
    const dbTodo = mappers.todo.toDb(todo);

    const result = await (trx ?? this.#db)
      .insertInto("todos")
      .values(dbTodo)
      .onConflict((oc) => oc.column("id").doUpdateSet(dbTodo))
      .executeTakeFirst();

    return result.numInsertedOrUpdatedRows! > 0n;
  };

  delete = async ({ id, userId }: TodoKey, trx?: Transaction<DB>) => {
    const result = await (trx ?? this.#db)
      .deleteFrom("todos")
      .where("id", "=", id)
      .$if(userId != null, (qb) => qb.where("userId", "=", userId!))
      .executeTakeFirst();

    return result.numDeletedRows > 0n;
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
