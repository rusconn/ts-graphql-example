import type { Kysely, Transaction } from "kysely";

import type { DB } from "../../db/types.ts";
import type * as Domain from "../../domain/todo.ts";
import { mappers } from "../../mappers.ts";

type TodoKey = {
  id: Domain.Todo["id"];
  userId?: Domain.Todo["userId"];
};

export class TodoRepoShared {
  #db;

  constructor(db: Kysely<DB>) {
    this.#db = db;
  }

  async find(id: Domain.Todo["id"], trx?: Transaction<DB>) {
    const todo = await (trx ?? this.#db)
      .selectFrom("todos")
      .where("id", "=", id)
      .selectAll()
      .$if(trx != null, (qb) => qb.forUpdate())
      .executeTakeFirst();

    return todo && mappers.todo.toDomain(todo);
  }

  async save(todo: Domain.Todo, trx?: Transaction<DB>) {
    const dbTodo = mappers.todo.toDb(todo);

    const result = await (trx ?? this.#db)
      .insertInto("todos")
      .values(dbTodo)
      .onConflict((oc) => oc.column("id").doUpdateSet(dbTodo))
      .executeTakeFirst();

    return result.numInsertedOrUpdatedRows! > 0n;
  }

  async delete({ id, userId }: TodoKey, trx?: Transaction<DB>) {
    const result = await (trx ?? this.#db)
      .deleteFrom("todos")
      .where("id", "=", id)
      .$if(userId != null, (qb) => qb.where("userId", "=", userId!))
      .executeTakeFirst();

    return result.numDeletedRows > 0n;
  }
}
