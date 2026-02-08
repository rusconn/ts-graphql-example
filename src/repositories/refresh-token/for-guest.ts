import type { Kysely, Transaction } from "kysely";

import type { DB } from "../../db/types.ts";
import type { Type } from "../../domain/refresh-token.ts";
import { RefreshTokenRepoShared } from "./shared.ts";

export class RefreshTokenRepoForGuest {
  #shared;

  constructor(db: Kysely<DB>) {
    this.#shared = new RefreshTokenRepoShared(db);
  }

  async add(userToken: Type, trx?: Transaction<DB>) {
    return await this.#shared.add(userToken, trx);
  }

  async touch(refreshToken: Type["token"], now: Date, trx?: Transaction<DB>) {
    return await this.#shared.touch(refreshToken, now, trx);
  }

  async retainLatest(userId: Type["id"], limit: number, trx?: Transaction<DB>) {
    return await this.#shared.retainLatest(userId, limit, trx);
  }
}
