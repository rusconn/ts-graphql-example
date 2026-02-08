import type { Kysely, Transaction } from "kysely";

import type * as Db from "../../db/types.ts";
import type { DB } from "../../db/types.ts";
import type * as Domain from "../../domain/credential.ts";
import { CredentialRepoShared } from "./shared.ts";

export class CredentialRepoForGuest {
  #shared;

  constructor(db: Kysely<DB>) {
    this.#shared = new CredentialRepoShared(db);
  }

  async findByDbId(id: Db.Credential["userId"], trx?: Transaction<DB>) {
    return await this.#shared.findByDbId(id, trx);
  }

  async findByDbEmail(email: Db.User["email"], trx?: Transaction<DB>) {
    return await this.#shared.findByDbEmail(email, trx);
  }

  async add(user: Domain.Type, trx?: Transaction<DB>) {
    return await this.#shared.add(user, trx);
  }

  async update(user: Domain.Type, trx?: Transaction<DB>) {
    return await this.#shared.update(user, trx);
  }

  async remove(id: Domain.Type["id"], trx?: Transaction<DB>) {
    return await this.#shared.remove(id, trx);
  }
}
