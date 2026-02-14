import type { Kysely } from "kysely";

import * as Dto from "../../../../application/queries/dto.ts";
import type * as Domain from "../../../../domain/entities.ts";
import type { DB } from "../../../datasources/_shared/types.ts";

export class CredentialQueryShared {
  #db;
  #tenantId;

  constructor(db: Kysely<DB>, tenantId?: Domain.User.Type["id"]) {
    this.#db = db;
    this.#tenantId = tenantId;
  }

  async findByEmail(email: Domain.User.Type["email"]) {
    const credential = await this.#db
      .selectFrom("credentials")
      .innerJoin("users", "credentials.userId", "users.id")
      .where("users.email", "=", email)
      .$if(this.#tenantId != null, (qb) => qb.where("credentials.userId", "=", this.#tenantId!))
      .selectAll("credentials")
      .executeTakeFirst();

    return credential && Dto.Credential.parseOrThrow(credential);
  }
}
