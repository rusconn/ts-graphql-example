import type { Kysely } from "kysely";

import type { DB, User } from "../../../datasources/_shared/types.ts";
import type * as Domain from "../../../../domain/models.ts";
import type { ICredentialQueryForAdmin } from "../../../../graphql/_queries/credential/for-admin.ts";
import { CredentialQueryShared } from "./shared.ts";

export class CredentialQueryForAdmin implements ICredentialQueryForAdmin {
  #shared;

  constructor(db: Kysely<DB>, tenantId: User["id"]) {
    this.#shared = new CredentialQueryShared(db, tenantId);
  }

  async findByEmail(email: Domain.User.Type["email"]) {
    return await this.#shared.findByEmail(email);
  }
}
