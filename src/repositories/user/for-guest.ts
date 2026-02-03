import type { Kysely, Transaction } from "kysely";

import type { DB } from "../../db/types.ts";
import type * as Domain from "../../domain/user.ts";
import { UserRepoShared } from "./shared.ts";

export class UserRepoForGuest {
  #shared;

  constructor(db: Kysely<DB>) {
    this.#shared = new UserRepoShared(db);
  }

  async findByEmail(email: Domain.User["email"], trx?: Transaction<DB>) {
    return await this.#shared.findByEmail(email, trx);
  }

  async save(user: Domain.User, trx?: Transaction<DB>) {
    return await this.#shared.save(user, trx);
  }
}
