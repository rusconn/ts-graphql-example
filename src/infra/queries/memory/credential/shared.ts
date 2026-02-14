import type { Kysely } from "kysely";

import type * as Domain from "../../../../domain/models.ts";
import * as Dto from "../../../../graphql/_dto.ts";
import type { DB, User } from "../../../datasources/_shared/types.ts";

export class CredentialQueryShared {
  #db;
  #tenantId;

  constructor(db: Kysely<DB>, tenantId?: User["id"]) {
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
