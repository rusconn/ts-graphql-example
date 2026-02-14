import type { Kysely } from "kysely";

import type { Todo as Domain } from "../../../../domain/models.ts";
import type { DB } from "../../../datasources/_shared/types.ts";
import { toDomain } from "../../../unit-of-works/db/_shared/todo.ts";

export class TodoRepoShared {
  #db;
  #tenantId;

  constructor(db: Kysely<DB>, tenantId?: Domain.Type["userId"]) {
    this.#db = db;
    this.#tenantId = tenantId;
  }

  async find(id: Domain.Type["id"]) {
    const todo = await this.#db
      .selectFrom("todos")
      .where("id", "=", id)
      .$if(this.#tenantId != null, (qb) => qb.where("userId", "=", this.#tenantId!))
      .selectAll()
      .executeTakeFirst();

    return todo && toDomain(todo);
  }
}
