import type { Kysely, Transaction } from "kysely";

import { type DB, type Todo, TodoStatus } from "../../../datasources/_shared/types.ts";
import { entityNotFoundError } from "../../../../domain/repos/_shared/errors.ts";
import { Todo as Domain } from "../../../../domain/models.ts";

export class TodoRepoShared {
  #db;
  #tenantId;

  constructor(db: Kysely<DB>, tenantId?: Domain.Type["userId"]) {
    this.#db = db;
    this.#tenantId = tenantId;
  }

  async find(id: Domain.Type["id"], trx?: Transaction<DB>) {
    const todo = await (trx ?? this.#db)
      .selectFrom("todos")
      .where("id", "=", id)
      .$if(this.#tenantId != null, (qb) => qb.where("userId", "=", this.#tenantId!))
      .selectAll()
      .$if(trx != null, (qb) => qb.forUpdate())
      .executeTakeFirst();

    return todo && toDomain(todo);
  }

  async add(todo: Domain.Type, trx: Transaction<DB>) {
    if (this.#tenantId != null && todo.userId !== this.#tenantId) {
      throw new Error("forbidden");
    }

    await trx
      .insertInto("todos") //
      .values(toDb(todo))
      .execute();
  }

  async update(todo: Domain.Type, trx: Transaction<DB>) {
    await trx
      .updateTable("todos")
      .set(toDb(todo))
      .where("id", "=", todo.id)
      .$if(this.#tenantId != null, (qb) => qb.where("userId", "=", this.#tenantId!))
      .returning("id")
      .executeTakeFirstOrThrow(entityNotFoundError);
  }

  async remove(id: Domain.Type["id"], trx: Transaction<DB>) {
    await trx
      .deleteFrom("todos")
      .where("id", "=", id)
      .$if(this.#tenantId != null, (qb) => qb.where("userId", "=", this.#tenantId!))
      .returning("id")
      .executeTakeFirstOrThrow(entityNotFoundError);
  }

  async removeByUserId(userId: Domain.Type["userId"], trx: Transaction<DB>) {
    await trx
      .deleteFrom("todos")
      .where("userId", "=", userId)
      .$if(this.#tenantId != null, (qb) => qb.where("userId", "=", this.#tenantId!))
      .execute();
  }
}

const toDb = ({ status, ...rest }: Domain.Type): Todo => {
  return {
    ...rest,
    status: toDbStatus[status],
  };
};

const toDbStatus: Record<Domain.Type["status"], TodoStatus> = {
  [Domain.Status.DONE]: TodoStatus.Done,
  [Domain.Status.PENDING]: TodoStatus.Pending,
};

export const toDomain = ({ status, ...rest }: Todo): Domain.Type => {
  return Domain.parseOrThrow({
    ...rest,
    status: toDomainStatus[status],
  });
};

const toDomainStatus: Record<TodoStatus, Domain.Type["status"]> = {
  [TodoStatus.Done]: Domain.Status.DONE,
  [TodoStatus.Pending]: Domain.Status.PENDING,
};
