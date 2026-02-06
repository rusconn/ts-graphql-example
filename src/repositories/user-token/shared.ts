import type { Kysely, Transaction } from "kysely";

import type { DB, User } from "../../db/types.ts";
import type { UserToken } from "../../domain/user-token.ts";

export class UserTokenRepoShared {
  #db;
  #tenantId;

  constructor(db: Kysely<DB>, tenantId?: User["id"]) {
    this.#db = db;
    this.#tenantId = tenantId;
  }

  async create(userToken: UserToken, trx?: Transaction<DB>) {
    if (this.#tenantId != null && userToken.userId !== this.#tenantId) {
      return "Forbidden";
    }

    const result = await (trx ?? this.#db)
      .insertInto("userTokens")
      .values(userToken)
      .executeTakeFirst();

    return result.numInsertedOrUpdatedRows! > 0n ? "Ok" : "Failed";
  }

  async touch(refreshToken: UserToken["refreshToken"], now: Date, trx?: Transaction<DB>) {
    const result = await (trx ?? this.#db)
      .updateTable("userTokens")
      .set("lastUsedAt", now)
      .where("refreshToken", "=", refreshToken)
      .executeTakeFirst();

    return result.numUpdatedRows > 0n ? "Ok" : "NotFound";
  }

  async retainLatest(userId: UserToken["userId"], limit: number, trx?: Transaction<DB>) {
    const result = await (trx ?? this.#db)
      .deleteFrom("userTokens")
      .where(({ eb }) =>
        eb(
          "refreshToken",
          "not in",
          eb
            .selectFrom("userTokens")
            .where("userId", "=", userId)
            .select("refreshToken")
            .orderBy("lastUsedAt", "desc")
            .limit(limit),
        ),
      )
      .executeTakeFirst();

    return result.numDeletedRows;
  }

  async delete(refreshToken: UserToken["refreshToken"], trx?: Transaction<DB>) {
    const result = await (trx ?? this.#db)
      .deleteFrom("userTokens")
      .where("refreshToken", "=", refreshToken)
      .$if(this.#tenantId != null, (qb) => qb.where("userId", "=", this.#tenantId!))
      .executeTakeFirst();

    return result.numDeletedRows > 0n ? "Ok" : "NotFound";
  }
}
