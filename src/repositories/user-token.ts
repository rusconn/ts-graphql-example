import type { Kysely, Transaction } from "kysely";

import type { DB } from "../db/types.ts";
import type { UserToken } from "../domain/user-token.ts";
import { mappers } from "../mappers.ts";

export class UserTokenRepo {
  #db;

  constructor(db: Kysely<DB>) {
    this.#db = db;
  }

  async find(userId: UserToken["userId"], trx?: Transaction<DB>) {
    const userToken = await (trx ?? this.#db)
      .selectFrom("userTokens")
      .where("userId", "=", userId)
      .selectAll()
      .$if(trx != null, (qb) => qb.forUpdate())
      .executeTakeFirst();

    return userToken && mappers.userToken.toDomain(userToken);
  }

  async save(userToken: UserToken, trx?: Transaction<DB>) {
    const result = await (trx ?? this.#db)
      .insertInto("userTokens")
      .values(userToken)
      .onConflict((oc) => oc.column("refreshToken").doUpdateSet(userToken))
      .executeTakeFirst();

    return result.numInsertedOrUpdatedRows! > 0n;
  }

  async touch(refreshToken: UserToken["refreshToken"], now: Date, trx?: Transaction<DB>) {
    const result = await (trx ?? this.#db)
      .updateTable("userTokens")
      .where("refreshToken", "=", refreshToken)
      .set("lastUsedAt", now)
      .executeTakeFirst();

    return result.numUpdatedRows > 0n;
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

  async delete(userId: UserToken["userId"], trx?: Transaction<DB>) {
    const result = await (trx ?? this.#db)
      .deleteFrom("userTokens")
      .where("userId", "=", userId)
      .executeTakeFirst();

    return result.numDeletedRows > 0n;
  }
}
