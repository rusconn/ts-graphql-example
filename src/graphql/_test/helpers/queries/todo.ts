import type { Transaction } from "kysely";

import * as Dto from "../../../../application/queries/dto.ts";
import type { DB } from "../../../../infra/datasources/_shared/types.ts";

export class TodoQuery {
  #trx;

  constructor(trx: Transaction<DB>) {
    this.#trx = trx;
  }
  async find(id: Dto.Todo.Type["id"]) {
    const todo = await this.#trx
      .selectFrom("todos") //
      .where("id", "=", id)
      .selectAll()
      .executeTakeFirst();

    return todo && Dto.Todo.parseOrThrow(todo);
  }

  async findOrThrow(id: Dto.Todo.Type["id"]) {
    const todo = await this.#trx
      .selectFrom("todos") //
      .where("id", "=", id)
      .selectAll()
      .executeTakeFirstOrThrow();

    return Dto.Todo.parseOrThrow(todo);
  }

  async countTheirs(userId: Dto.Todo.Type["userId"]) {
    const result = await this.#trx
      .selectFrom("todos")
      .where("userId", "=", userId)
      .select(({ fn }) => fn.count<number>("userId").as("count"))
      .executeTakeFirstOrThrow();

    return result.count;
  }

  async count() {
    const result = await this.#trx
      .selectFrom("todos")
      .select(({ fn }) => fn.count<number>("userId").as("count"))
      .executeTakeFirstOrThrow();

    return result.count;
  }
}
