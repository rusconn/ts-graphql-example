import type { Transaction } from "kysely";

import type * as Domain from "../../../domain/entities.ts";
import type { IUserRepoForGuest } from "../../../domain/repositories/user/for-guest.ts";
import type { DB } from "../../datasources/db/types.ts";
import { UserRepoShared } from "./shared.ts";

export class UserRepoForGuest implements IUserRepoForGuest {
  #shared;

  constructor(trx: Transaction<DB>) {
    this.#shared = new UserRepoShared(trx);
  }

  async add(user: Domain.User.Type) {
    return await this.#shared.add(user);
  }

  async update(user: Domain.User.Type) {
    return await this.#shared.update(user);
  }
}
