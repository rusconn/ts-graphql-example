import type { Transaction } from "kysely";

import type * as Domain from "../../../../domain/entities.ts";
import type { IRefreshTokenRepoForGuest } from "../../../../domain/unit-of-works/for-guest/refresh-token.ts";
import type { DB } from "../../../datasources/_shared/types.ts";
import { RefreshTokenRepoShared } from "../_shared/refresh-token.ts";

export class RefreshTokenRepoForGuest implements IRefreshTokenRepoForGuest {
  #shared;

  constructor(trx: Transaction<DB>) {
    this.#shared = new RefreshTokenRepoShared(trx);
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
}
