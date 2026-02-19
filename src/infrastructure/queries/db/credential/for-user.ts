import type { Kysely } from "kysely";

import type { ICredentialQueryForUser } from "../../../../application/queries/credential/for-user.ts";
import type * as Domain from "../../../../domain/entities.ts";
import type { DB } from "../../../datasources/_shared/types.ts";
import { CredentialQueryShared } from "./shared.ts";

export class CredentialQueryForUser implements ICredentialQueryForUser {
  #shared;

  constructor(db: Kysely<DB>, tenantId: Domain.User.Type["id"]) {
    this.#shared = new CredentialQueryShared(db, tenantId);
  }

  async findByEmail(email: Domain.User.Type["email"]) {
    return await this.#shared.findByEmail(email);
  }
}
