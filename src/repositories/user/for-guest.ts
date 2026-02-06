import type { Kysely, Transaction } from "kysely";

import type { DB } from "../../db/types.ts";
import type * as Domain from "../../domain/user.ts";
import { UserRepoShared } from "./shared.ts";

export class UserRepoForGuest {
  #shared;

  constructor(db: Kysely<DB>) {
    this.#shared = new UserRepoShared(db);
  }

  async add(user: Domain.User, trx?: Transaction<DB>) {
    return await this.#shared.add(user, trx);
  }

  async update(user: Domain.User, trx?: Transaction<DB>) {
    return await this.#shared.update(user, trx);
  }
}
