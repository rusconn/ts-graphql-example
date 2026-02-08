import type { Kysely } from "kysely";

import type { DB } from "../../../datasources/_shared/types.ts";
import type * as Domain from "../../../../domain/models.ts";
import type { ICredentialQueryForGuest } from "../../../../graphql/_queries/credential/for-guest.ts";
import { CredentialQueryShared } from "./shared.ts";

export class CredentialQueryForGuest implements ICredentialQueryForGuest {
  #shared;

  constructor(db: Kysely<DB>) {
    this.#shared = new CredentialQueryShared(db);
  }

  async findByEmail(email: Domain.User.Type["email"]) {
    return await this.#shared.findByEmail(email);
  }
}
