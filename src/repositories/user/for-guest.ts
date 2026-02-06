import type { Kysely, Transaction } from "kysely";

import type { DB } from "../../db/types.ts";
import type * as Domain from "../../domain/user.ts";
import { UserRepoShared } from "./shared.ts";

export class UserRepoForGuest {
  #shared;

  constructor(db: Kysely<DB>) {
    this.#shared = new UserRepoShared(db);
  }

  async create(user: Domain.User, trx?: Transaction<DB>) {
    return await this.#shared.create(user, trx);
  }

  async update(user: Domain.User, trx?: Transaction<DB>) {
    return await this.#shared.update(user, trx);
  }
}
