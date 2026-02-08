import type { Kysely, Transaction } from "kysely";

import type { DB } from "../../../datasources/_shared/types.ts";
import type * as Domain from "../../../../domain/models.ts";
import type { IRefreshTokenRepoForAdmin } from "../../../../domain/repos/refresh-token/for-admin.ts";
import { RefreshTokenRepoShared } from "./shared.ts";

export class RefreshTokenRepoForAdmin implements IRefreshTokenRepoForAdmin {
  #shared;

  constructor(db: Kysely<DB>, tenantId: Domain.User.Type["id"]) {
    this.#shared = new RefreshTokenRepoShared(db, tenantId);
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

  async remove(token: Domain.RefreshToken.Type["token"], trx: Transaction<DB>) {
    return await this.#shared.remove(token, trx);
  }

  async removeByUserId(userId: Domain.RefreshToken.Type["userId"], trx: Transaction<DB>) {
    return await this.#shared.removeByUserId(userId, trx);
  }
}
