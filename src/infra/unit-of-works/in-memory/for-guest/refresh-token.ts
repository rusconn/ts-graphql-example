import type * as Domain from "../../../../domain/entities.ts";
import type { IRefreshTokenRepoForGuest } from "../../../../domain/unit-of-works/for-guest/refresh-token.ts";
import type { InMemoryDb } from "../../../datasources/in-memory/store.ts";
import { RefreshTokenRepoShared } from "../_shared/refresh-token.ts";

export class RefreshTokenRepoForGuest implements IRefreshTokenRepoForGuest {
  #shared;

  constructor(trx: InMemoryDb) {
    this.#shared = new RefreshTokenRepoShared(trx);
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
}
