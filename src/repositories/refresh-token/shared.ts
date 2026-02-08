import type { Kysely, Transaction } from "kysely";

import type { DB, RefreshToken, User } from "../../db/types.ts";
import type * as Domain from "../../domain.ts";

export class RefreshTokenRepoShared {
  #db;
  #tenantId;

  constructor(db: Kysely<DB>, tenantId?: User["id"]) {
    this.#db = db;
    this.#tenantId = tenantId;
  }

  async add(refreshToken: Domain.RefreshToken.Type, trx?: Transaction<DB>) {
    if (this.#tenantId != null && refreshToken.id !== this.#tenantId) {
      throw new Error("Forbidden");
    }

    const dbRefreshToken = toDb(refreshToken);

    const result = await (trx ?? this.#db)
      .insertInto("refreshTokens")
      .values(dbRefreshToken)
      .executeTakeFirst();

    return result.numInsertedOrUpdatedRows! > 0n ? "Ok" : "Failed";
  }

  async touch(token: Domain.RefreshToken.Type["token"], now: Date, trx?: Transaction<DB>) {
    const result = await (trx ?? this.#db)
      .updateTable("refreshTokens")
      .set("lastUsedAt", now)
      .where("token", "=", token)
      .executeTakeFirst();

    return result.numUpdatedRows > 0n ? "Ok" : "NotFound";
  }

  async retainLatest(userId: Domain.RefreshToken.Type["id"], limit: number, trx?: Transaction<DB>) {
    const result = await (trx ?? this.#db)
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

    return result.numDeletedRows;
  }

  async remove(token: Domain.RefreshToken.Type["token"], trx?: Transaction<DB>) {
    const result = await (trx ?? this.#db)
      .deleteFrom("refreshTokens")
      .where("token", "=", token)
      .$if(this.#tenantId != null, (qb) => qb.where("userId", "=", this.#tenantId!))
      .executeTakeFirst();

    return result.numDeletedRows > 0n ? "Ok" : "NotFound";
  }
}

const toDb = ({ id, ...rest }: Domain.RefreshToken.Type): RefreshToken => ({
  ...rest,
  userId: id,
});
