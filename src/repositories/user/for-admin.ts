import type { Kysely, Transaction } from "kysely";

import type { DB, User } from "../../db/types.ts";
import type * as Domain from "../../domain/user.ts";
import { UserRepoShared } from "./shared.ts";

export class UserRepoForAdmin {
  #shared;

  constructor(db: Kysely<DB>) {
    this.#shared = new UserRepoShared(db);
  }

  async findByDbId(id: User["id"], trx?: Transaction<DB>) {
    return await this.#shared.findByDbId(id, trx);
  }

  async findByEmail(email: Domain.User["email"], trx?: Transaction<DB>) {
    return await this.#shared.findByEmail(email, trx);
  }

  async save(user: Domain.User, trx?: Transaction<DB>) {
    return await this.#shared.save(user, trx);
  }

  async delete(id: Domain.User["id"], trx?: Transaction<DB>) {
    return await this.#shared.delete(id, trx);
  }
}
