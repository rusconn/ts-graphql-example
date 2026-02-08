import type { Kysely, Transaction } from "kysely";

import type { DB, User } from "../../db/types.ts";
import type { Type } from "../../domain/refresh-token.ts";
import { RefreshTokenRepoShared } from "./shared.ts";

export class RefreshTokenRepoForAdmin {
  #shared;

  constructor(db: Kysely<DB>, tenantId: User["id"]) {
    this.#shared = new RefreshTokenRepoShared(db, tenantId);
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

  async remove(refreshToken: Type["token"], trx?: Transaction<DB>) {
    return await this.#shared.remove(refreshToken, trx);
  }
}
