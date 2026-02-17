import type * as Domain from "../../../../domain/entities.ts";
import type { IRefreshTokenRepoForUser } from "../../../../domain/unit-of-works/for-user/refresh-token.ts";
import type { InMemoryDb } from "../../../datasources/in-memory/store.ts";
import { RefreshTokenRepoShared } from "../_shared/refresh-token.ts";

export class RefreshTokenRepoForUser implements IRefreshTokenRepoForUser {
  #shared;

  constructor(trx: InMemoryDb, tenantId: Domain.User.Type["id"]) {
    this.#shared = new RefreshTokenRepoShared(trx, tenantId);
  }

  async add(refreshToken: Domain.RefreshToken.Type) {
    return await this.#shared.add(refreshToken);
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
