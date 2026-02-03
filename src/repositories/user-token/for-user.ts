import type { Kysely, Transaction } from "kysely";

import type { DB } from "../../db/types.ts";
import type { UserToken } from "../../domain/user-token.ts";
import { UserTokenRepoShared } from "./shared.ts";

export class UserTokenRepoForUser {
  #shared;

  constructor(db: Kysely<DB>) {
    this.#shared = new UserTokenRepoShared(db);
  }

  async save(userToken: UserToken, trx?: Transaction<DB>) {
    return await this.#shared.save(userToken, trx);
  }

  async touch(refreshToken: UserToken["refreshToken"], now: Date, trx?: Transaction<DB>) {
    return await this.#shared.touch(refreshToken, now, trx);
  }

  async retainLatest(userId: UserToken["userId"], limit: number, trx?: Transaction<DB>) {
    return await this.#shared.retainLatest(userId, limit, trx);
  }

  async delete(refreshToken: UserToken["refreshToken"], trx?: Transaction<DB>) {
    return await this.#shared.delete(refreshToken, trx);
  }
}
