import type { Transaction } from "kysely";

import { Todo as Domain } from "../../../../domain/models.ts";
import { entityNotFoundError } from "../../../../domain/unit-of-works/_shared/errors.ts";
import { type DB, type Todo, TodoStatus } from "../../../datasources/_shared/types.ts";

export class TodoRepoShared {
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
