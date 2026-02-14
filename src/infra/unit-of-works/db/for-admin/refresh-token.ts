import type { Transaction } from "kysely";

import type * as Domain from "../../../../domain/entities.ts";
import type { IRefreshTokenRepoForAdmin } from "../../../../domain/unit-of-works/for-admin/refresh-token.ts";
import type { DB } from "../../../datasources/_shared/types.ts";
import { RefreshTokenRepoShared } from "../_shared/refresh-token.ts";

export class RefreshTokenRepoForAdmin implements IRefreshTokenRepoForAdmin {
  #shared;

  constructor(trx: Transaction<DB>, tenantId: Domain.User.Type["id"]) {
    this.#shared = new RefreshTokenRepoShared(trx, tenantId);
  }

  async add(refreshToken: Domain.RefreshToken.Type) {
    return await this.#shared.add(refreshToken);
  }

  async touch(token: Domain.RefreshToken.Type["token"], now: Date) {
    return await this.#shared.touch(token, now);
  }

  async retainLatest(userId: Domain.RefreshToken.Type["userId"], limit: number) {
    return await this.#shared.retainLatest(userId, limit);
  }

  async remove(token: Domain.RefreshToken.Type["token"]) {
    return await this.#shared.remove(token);
  }

  async removeByUserId(userId: Domain.RefreshToken.Type["userId"]) {
    return await this.#shared.removeByUserId(userId);
  }
}
