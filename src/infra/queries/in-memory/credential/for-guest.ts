import type { ICredentialQueryForGuest } from "../../../../application/queries/credential/for-guest.ts";
import type * as Domain from "../../../../domain/entities.ts";
import type { InMemoryDb } from "../../../datasources/in-memory/store.ts";
import { CredentialQueryShared } from "./shared.ts";

export class CredentialQueryForGuest implements ICredentialQueryForGuest {
  #shared;

  constructor(db: InMemoryDb) {
    this.#shared = new CredentialQueryShared(db);
  }

  async findByEmail(email: Domain.User.Type["email"]) {
    return await this.#shared.findByEmail(email);
  }
}
