import type { User as Domain } from "../../../../domain/entities.ts";
import type { InMemoryDb } from "../../../datasources/in-memory/store.ts";
import { toDomain } from "../../../unit-of-works/db/_shared/user.ts";

export class UserRepoShared {
  #db;
  #tenantId;

  constructor(db: InMemoryDb, tenantId?: Domain.Type["id"]) {
    this.#db = db;
    this.#tenantId = tenantId;
  }

  async find(id: Domain.Type["id"]) {
    const user = this.#db.users.get(id);
    if (!user) {
      return undefined;
    }

    const credential = this.#db.credentials.get(id);
    if (!credential) {
      return undefined;
    }

    if (this.#tenantId != null && user.id !== this.#tenantId) {
      return undefined;
    }

    return toDomain(user, credential);
  }
}
