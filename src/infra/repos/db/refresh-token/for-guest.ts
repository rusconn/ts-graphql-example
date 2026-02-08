import type { Kysely, Transaction } from "kysely";

import type { DB } from "../../../datasources/_shared/types.ts";
import type * as Domain from "../../../../domain/models.ts";
import type { IRefreshTokenRepoForGuest } from "../../../../domain/repos/refresh-token/for-guest.ts";
import { RefreshTokenRepoShared } from "./shared.ts";

export class RefreshTokenRepoForGuest implements IRefreshTokenRepoForGuest {
  #shared;

  constructor(db: Kysely<DB>) {
    this.#shared = new RefreshTokenRepoShared(db);
  }

  async add(refreshToken: Domain.RefreshToken.Type, trx: Transaction<DB>) {
    return await this.#shared.add(refreshToken, trx);
  }

  async touch(token: Domain.RefreshToken.Type["token"], now: Date, trx: Transaction<DB>) {
    return await this.#shared.touch(token, now, trx);
  }

  async retainLatest(
    userId: Domain.RefreshToken.Type["userId"],
    limit: number,
    trx: Transaction<DB>,
  ) {
    return await this.#shared.retainLatest(userId, limit, trx);
  }
}
