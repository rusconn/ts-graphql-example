import type { Kysely, Transaction } from "kysely";

import { type DB, type Todo, TodoStatus, type User } from "../../db/types.ts";
import * as Domain from "../../domain.ts";

export class TodoRepoShared {
  #db;
  #tenantId;

  constructor(db: Kysely<DB>, tenantId?: User["id"]) {
    this.#db = db;
    this.#tenantId = tenantId;
  }

  async find(id: Domain.Todo.Type["id"], trx?: Transaction<DB>) {
    const todo = await (trx ?? this.#db)
      .selectFrom("todos")
      .where("id", "=", id)
      .$if(this.#tenantId != null, (qb) => qb.where("userId", "=", this.#tenantId!))
      .selectAll()
      .$if(trx != null, (qb) => qb.forUpdate())
      .executeTakeFirst();

    return todo && toDomain(todo);
  }

  async add(todo: Domain.Todo.Type, trx?: Transaction<DB>) {
    if (this.#tenantId != null && todo.userId !== this.#tenantId) {
      throw new Error("Forbidden");
    }

    const dbTodo = toDb(todo);

    const result = await (trx ?? this.#db)
      .insertInto("todos") //
      .values(dbTodo)
      .executeTakeFirst();

    return result.numInsertedOrUpdatedRows! > 0n ? "Ok" : "Failed";
  }

  async update(todo: Domain.Todo.Type, trx?: Transaction<DB>) {
    const dbTodo = toDb(todo);

    const result = await (trx ?? this.#db)
      .updateTable("todos")
      .set(dbTodo)
      .where("id", "=", todo.id)
      .$if(this.#tenantId != null, (qb) => qb.where("userId", "=", this.#tenantId!))
      .executeTakeFirst();

    return result.numUpdatedRows > 0n ? "Ok" : "NotFound";
  }

  async remove(id: Domain.Todo.Type["id"], trx?: Transaction<DB>) {
    const result = await (trx ?? this.#db)
      .deleteFrom("todos")
      .where("id", "=", id)
      .$if(this.#tenantId != null, (qb) => qb.where("userId", "=", this.#tenantId!))
      .executeTakeFirst();

    return result.numDeletedRows > 0n ? "Ok" : "NotFound";
  }
}

const toDb = ({ status, ...rest }: Domain.Todo.Type): Todo => ({
  ...rest,
  status: {
    [Domain.Todo.Status.DONE]: TodoStatus.Done,
    [Domain.Todo.Status.PENDING]: TodoStatus.Pending,
  }[status],
});

const toDomain = ({ id, status, userId, ...rest }: Todo): Domain.Todo.Type => ({
  ...rest,
  id: id as Domain.Todo.Type["id"],
  status: {
    [TodoStatus.Done]: Domain.Todo.Status.DONE,
    [TodoStatus.Pending]: Domain.Todo.Status.PENDING,
  }[status],
  userId: userId as Domain.Todo.Type["userId"],
});
