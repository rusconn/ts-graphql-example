import type { Transaction } from "kysely";

import { RefreshToken as Domain } from "../../../../domain/entities.ts";
import { entityNotFoundError } from "../../../../domain/unit-of-works/_errors/entity-not-found.ts";
import type { DB, RefreshToken } from "../../../datasources/_shared/types.ts";

export class RefreshTokenRepoShared {
  #trx;
  #tenantId;

  constructor(trx: Transaction<DB>, tenantId?: Domain.Type["userId"]) {
    this.#trx = trx;
    this.#tenantId = tenantId;
  }

  async add(refreshToken: Domain.Type) {
    if (this.#tenantId != null && refreshToken.userId !== this.#tenantId) {
      throw new Error("forbidden");
    }

    const dbRefreshToken = toDb(refreshToken);

    await this.#trx
      .insertInto("refreshTokens") //
      .values(dbRefreshToken)
      .execute();
  }

  async retainLatest(userId: Domain.Type["userId"], limit: number) {
    await this.#trx
      .deleteFrom("refreshTokens")
      .where(({ eb }) =>
        eb(
          "token",
          "not in",
          eb
            .selectFrom("refreshTokens")
            .where("userId", "=", userId)
            .$if(this.#tenantId != null, (qb) => qb.where("userId", "=", this.#tenantId!))
            .select("token")
            .orderBy("createdAt", "desc")
            .limit(limit),
        ),
      )
      .$if(this.#tenantId != null, (qb) => qb.where("userId", "=", this.#tenantId!))
      .executeTakeFirst();
  }

  async remove(token: Domain.Type["token"]) {
    await this.#trx
      .deleteFrom("refreshTokens")
      .where("token", "=", token)
      .$if(this.#tenantId != null, (qb) => qb.where("userId", "=", this.#tenantId!))
      .returning("userId")
      .executeTakeFirstOrThrow(entityNotFoundError);
  }

  async removeByUserId(userId: Domain.Type["userId"]) {
    await this.#trx
      .deleteFrom("refreshTokens")
      .where("userId", "=", userId)
      .$if(this.#tenantId != null, (qb) => qb.where("userId", "=", this.#tenantId!))
      .execute();
  }
}

export const toDb = (refreshToken: Domain.Type): RefreshToken => {
  return refreshToken;
};

export const toDomain = (refreshToken: RefreshToken): Domain.Type => {
  return Domain.parseOrThrow(refreshToken);
};
