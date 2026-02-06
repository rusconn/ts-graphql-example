import type { Kysely, Transaction } from "kysely";

import type * as Db from "../../db/types.ts";
import type { DB } from "../../db/types.ts";
import type * as Domain from "../../domain/user-credential.ts";
import { UserCredentialRepoShared } from "./shared.ts";

export class UserCredentialRepoForAdmin {
  #shared;

  constructor(db: Kysely<DB>, tenantId: Db.User["id"]) {
    this.#shared = new UserCredentialRepoShared(db, tenantId);
  }

  async findByDbId(id: Db.UserCredential["userId"], trx?: Transaction<DB>) {
    return await this.#shared.findByDbId(id, trx);
  }

  async findByDbEmail(email: Db.User["email"], trx?: Transaction<DB>) {
    return await this.#shared.findByDbEmail(email, trx);
  }

  async create(user: Domain.UserCredential, trx?: Transaction<DB>) {
    return await this.#shared.create(user, trx);
  }

  async update(user: Domain.UserCredential, trx?: Transaction<DB>) {
    return await this.#shared.update(user, trx);
  }

  async delete(id: Domain.UserCredential["id"], trx?: Transaction<DB>) {
    return await this.#shared.delete(id, trx);
  }
}
