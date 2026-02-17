import type { Transaction } from "kysely";

import * as Dto from "../../../../application/queries/dto.ts";
import type { DB } from "../../../../infra/datasources/_shared/types.ts";

export class CredentialQuery {
  #trx;

  constructor(trx: Transaction<DB>) {
    this.#trx = trx;
  }

  async find(userId: Dto.Credential.Type["userId"]) {
    const credential = await this.#trx
      .selectFrom("credentials") //
      .where("userId", "=", userId)
      .selectAll()
      .executeTakeFirst();

    return credential && Dto.Credential.parseOrThrow(credential);
  }

  async findOrThrow(userId: Dto.Credential.Type["userId"]) {
    const credential = await this.#trx
      .selectFrom("credentials") //
      .where("userId", "=", userId)
      .selectAll()
      .executeTakeFirstOrThrow();

    return Dto.Credential.parseOrThrow(credential);
  }
}
