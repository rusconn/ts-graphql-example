import type { Kysely, Transaction } from "kysely";

import type { DB, User } from "../../db/types.ts";
import type * as Domain from "../../domain/todo.ts";
import { mappers } from "../../mappers.ts";

export class TodoRepoShared {
  #db;
  #tenantId;

  constructor(db: Kysely<DB>, tenantId?: User["id"]) {
    this.#db = db;
    this.#tenantId = tenantId;
  }

  async find(id: Domain.Todo["id"], trx?: Transaction<DB>) {
    const todo = await (trx ?? this.#db)
      .selectFrom("todos")
      .where("id", "=", id)
      .$if(this.#tenantId != null, (qb) => qb.where("userId", "=", this.#tenantId!))
      .selectAll()
      .$if(trx != null, (qb) => qb.forUpdate())
      .executeTakeFirst();

    return todo && mappers.todo.toDomain(todo);
  }

  // TODO: split save into (create, update)
  async save(todo: Domain.Todo, trx?: Transaction<DB>) {
    const found = await this.find(todo.id, trx);

    return found
      ? await this.#update(todo, trx) //
      : await this.#create(todo, trx);
  }

  async #create(todo: Domain.Todo, trx?: Transaction<DB>) {
    if (this.#tenantId != null && todo.userId !== this.#tenantId) {
      return "Forbidden";
    }

    const dbTodo = mappers.todo.toDb(todo);

    const result = await (trx ?? this.#db)
      .insertInto("todos") //
      .values(dbTodo)
      .executeTakeFirst();

    return result.numInsertedOrUpdatedRows! > 0n ? "Ok" : "Failed";
  }

  async #update(todo: Domain.Todo, trx?: Transaction<DB>) {
    const dbTodo = mappers.todo.toDb(todo);

    const result = await (trx ?? this.#db)
      .updateTable("todos")
      .set(dbTodo)
      .where("id", "=", todo.id)
      .$if(this.#tenantId != null, (qb) => qb.where("userId", "=", this.#tenantId!))
      .executeTakeFirst();

    return result.numUpdatedRows > 0n ? "Ok" : "NotFound";
  }

  async delete(id: Domain.Todo["id"], trx?: Transaction<DB>) {
    const result = await (trx ?? this.#db)
      .deleteFrom("todos")
      .where("id", "=", id)
      .$if(this.#tenantId != null, (qb) => qb.where("userId", "=", this.#tenantId!))
      .executeTakeFirst();

    return result.numDeletedRows > 0n ? "Ok" : "NotFound";
  }
}
