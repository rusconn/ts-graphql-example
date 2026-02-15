import * as Dto from "../../../../application/queries/dto.ts";
import type * as Domain from "../../../../domain/entities.ts";
import type { InMemoryDb } from "../../../datasources/in-memory/store.ts";

export class CredentialQueryShared {
  #db;
  #tenantId;

  constructor(db: InMemoryDb, tenantId?: Domain.User.Type["id"]) {
    this.#db = db;
    this.#tenantId = tenantId;
  }

  async findByEmail(email: Domain.User.Type["email"]) {
    const user = this.#db.users.values().find((user) => user.email === email);
    if (!user) {
      return undefined;
    }

    const credential = this.#db.credentials.get(user.id);
    if (!credential) {
      return undefined;
    }

    if (this.#tenantId != null && credential.userId !== this.#tenantId) {
      return undefined;
    }

    return credential && Dto.Credential.parseOrThrow(credential);
  }
}
