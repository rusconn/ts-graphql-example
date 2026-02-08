import type { Kysely, Transaction } from "kysely";

import type { DB, RefreshToken, User } from "../../../datasources/_shared/types.ts";
import { RefreshToken as Domain } from "../../../../domain/models.ts";
import { entityNotFoundError } from "../../../../domain/repos/_shared/errors.ts";

export class RefreshTokenRepoShared {
  #db;
  #tenantId;

  constructor(db: Kysely<DB>, tenantId?: User["id"]) {
    this.#db = db;
    this.#tenantId = tenantId;
  }

  async add(refreshToken: Domain.Type, trx?: Transaction<DB>) {
    if (this.#tenantId != null && refreshToken.userId !== this.#tenantId) {
      throw new Error("forbidden");
    }

    const dbRefreshToken = toDb(refreshToken);

    await (trx ?? this.#db)
      .insertInto("refreshTokens") //
      .values(dbRefreshToken)
      .execute();
  }

  async touch(token: Domain.Type["token"], now: Date, trx?: Transaction<DB>) {
    await (trx ?? this.#db)
      .updateTable("refreshTokens")
      .set("lastUsedAt", now)
      .where("token", "=", token)
      .returning("userId")
      .executeTakeFirstOrThrow(entityNotFoundError);
  }

  async retainLatest(userId: Domain.Type["userId"], limit: number, trx?: Transaction<DB>) {
    await (trx ?? this.#db)
      .deleteFrom("refreshTokens")
      .where(({ eb }) =>
        eb(
          "token",
          "not in",
          eb
            .selectFrom("refreshTokens")
            .where("userId", "=", userId)
            .select("token")
            .orderBy("lastUsedAt", "desc")
            .limit(limit),
        ),
      )
      .executeTakeFirst();
  }

  async remove(token: Domain.Type["token"], trx?: Transaction<DB>) {
    await (trx ?? this.#db)
      .deleteFrom("refreshTokens")
      .where("token", "=", token)
      .$if(this.#tenantId != null, (qb) => qb.where("userId", "=", this.#tenantId!))
      .returning("userId")
      .executeTakeFirstOrThrow(entityNotFoundError);
  }

  async removeByUserId(userId: Domain.Type["userId"], trx?: Transaction<DB>) {
    await (trx ?? this.#db)
      .deleteFrom("refreshTokens")
      .where("userId", "=", userId)
      .$if(this.#tenantId != null, (qb) => qb.where("userId", "=", this.#tenantId!))
      .execute();
  }
}

const toDb = (refreshToken: Domain.Type): RefreshToken => {
  return refreshToken;
};

export const toDomain = (refreshToken: RefreshToken): Domain.Type => {
  return Domain.parseOrThrow(refreshToken);
};
