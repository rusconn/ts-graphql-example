import type { Transaction } from "kysely";

import * as Dto from "../../../../application/queries/dto.ts";
import type { DB } from "../../../../infra/datasources/_shared/types.ts";

export class UserQuery {
  #trx;

  constructor(trx: Transaction<DB>) {
    this.#trx = trx;
  }

  async findOrThrow(id: Dto.User.Type["id"]) {
    const user = await this.#trx
      .selectFrom("users") //
      .where("id", "=", id)
      .selectAll()
      .executeTakeFirstOrThrow();

    return Dto.User.parseOrThrow(user);
  }
}
