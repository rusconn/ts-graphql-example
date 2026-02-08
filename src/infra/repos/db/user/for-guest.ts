import type { Kysely, Transaction } from "kysely";

import type { DB } from "../../../datasources/_shared/types.ts";
import type * as Domain from "../../../../domain/models.ts";
import type { IUserRepoForGuest } from "../../../../domain/repos/user/for-guest.ts";
import { UserRepoShared } from "./shared.ts";

export class UserRepoForGuest implements IUserRepoForGuest {
  #shared;

  constructor(db: Kysely<DB>) {
    this.#shared = new UserRepoShared(db);
  }

  async add(user: Domain.User.Type, trx: Transaction<DB>) {
    return await this.#shared.add(user, trx);
  }

  async update(user: Domain.User.Type, trx: Transaction<DB>) {
    return await this.#shared.update(user, trx);
  }
}
