import type { Transaction } from "kysely";

import { Todo as Domain } from "../../domain/entities.ts";
import { entityNotFoundError } from "../../domain/errors/entity-not-found.ts";
import type { ITodoRepoForAdmin } from "../../domain/repositories/todo/for-admin.ts";
import type { ITodoRepoForUser } from "../../domain/repositories/todo/for-user.ts";
import { TodoStatus, type DB, type Todo } from "../datasources/db/types.ts";

export class TodoRepo implements ITodoRepoForAdmin, ITodoRepoForUser {
  #trx;
  #tenantId;

  constructor(trx: Transaction<DB>, tenantId?: Domain.Type["userId"]) {
    this.#trx = trx;
    this.#tenantId = tenantId;
  }

  async add(todo: Domain.Type) {
    if (this.#tenantId != null && todo.userId !== this.#tenantId) {
      throw new Error("forbidden");
    }

    await this.#trx
      .insertInto("todos") //
      .values(toDb(todo))
      .execute();
  }

  async update(todo: Domain.Type) {
    await this.#trx
      .updateTable("todos")
      .set(toDb(todo))
      .where("id", "=", todo.id)
      .$if(this.#tenantId != null, (qb) => qb.where("userId", "=", this.#tenantId!))
      .returning("id")
      .executeTakeFirstOrThrow(entityNotFoundError);
  }

  async remove(id: Domain.Type["id"]) {
    await this.#trx
      .deleteFrom("todos")
      .where("id", "=", id)
      .$if(this.#tenantId != null, (qb) => qb.where("userId", "=", this.#tenantId!))
      .returning("id")
      .executeTakeFirstOrThrow(entityNotFoundError);
  }

  async removeByUserId(userId: Domain.Type["userId"]) {
    await this.#trx
      .deleteFrom("todos")
      .where("userId", "=", userId)
      .$if(this.#tenantId != null, (qb) => qb.where("userId", "=", this.#tenantId!))
      .execute();
  }
}

export function toDb({ status, ...rest }: Domain.Type): Todo {
  return {
    ...rest,
    status: toDbStatus[status],
  };
}

export const toDbStatus: Record<Domain.Type["status"], TodoStatus> = {
  [Domain.Status.DONE]: TodoStatus.Done,
  [Domain.Status.PENDING]: TodoStatus.Pending,
};

export function toDomain({ status, ...rest }: Todo): Domain.Type {
  return Domain.parseOrThrow({
    ...rest,
    status,
  });
}
