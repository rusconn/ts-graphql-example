import type { RefreshToken as Domain } from "../../../../domain/entities.ts";
import { entityNotFoundError } from "../../../../domain/unit-of-works/_errors/entity-not-found.ts";
import type { InMemoryDb } from "../../../datasources/in-memory/store.ts";
import { toDb } from "../../db/_shared/refresh-token.ts";

export class RefreshTokenRepoShared {
  #trx;
  #tenantId;

  constructor(trx: InMemoryDb, tenantId?: Domain.Type["userId"]) {
    this.#trx = trx;
    this.#tenantId = tenantId;
  }

  async add(refreshToken: Domain.Type) {
    if (this.#tenantId != null && refreshToken.userId !== this.#tenantId) {
      throw new Error("forbidden");
    }

    const dbRefreshToken = toDb(refreshToken);

    if (this.#trx.refreshTokens.has(dbRefreshToken.token)) {
      throw new Error(`conflict: ${dbRefreshToken.token}`);
    } else {
      this.#trx.refreshTokens.set(dbRefreshToken.token, dbRefreshToken);
    }
  }

  async retainLatest(userId: Domain.Type["userId"], limit: number) {
    const refreshTokens = this.#trx.refreshTokens
      .entries()
      .filter(([_, value]) => value.userId === userId);

    const refreshTokensDesc = refreshTokens
      .toArray()
      .sort((a, b) => b[1].createdAt.getTime() - a[1].createdAt.getTime());

    const olds = refreshTokensDesc.slice(limit);

    if (this.#tenantId != null && userId !== this.#tenantId) {
      return;
    }

    for (const [key] of olds) {
      this.#trx.refreshTokens.delete(key);
    }
  }

  async remove(token: Domain.Type["token"]) {
    const refreshToken = this.#trx.refreshTokens.get(token);
    if (!refreshToken) {
      throw entityNotFoundError();
    }

    if (this.#tenantId != null && refreshToken.userId !== this.#tenantId) {
      throw entityNotFoundError();
    }

    this.#trx.refreshTokens.delete(token);
  }

  async removeByUserId(userId: Domain.Type["userId"]) {
    const refreshTokens = this.#trx.refreshTokens
      .entries()
      .filter(([_, value]) => value.userId === userId);

    if (this.#tenantId != null && userId !== this.#tenantId) {
      return;
    }

    for (const [key, _] of refreshTokens) {
      this.#trx.refreshTokens.delete(key);
    }
  }
}
