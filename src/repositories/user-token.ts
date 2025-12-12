import type { Kysely, Transaction } from "kysely";

import type { DB } from "../db/types.ts";
import type { UserToken } from "../domain/user-token.ts";
import { mappers } from "../mappers.ts";

export class UserTokenRepo {
  #db;

  constructor(db: Kysely<DB>) {
    this.#db = db;
  }

  find = async (userId: UserToken["userId"], trx?: Transaction<DB>) => {
    const userToken = await (trx ?? this.#db)
      .selectFrom("userTokens")
      .where("userId", "=", userId)
      .selectAll()
      .$if(trx != null, (qb) => qb.forUpdate())
      .executeTakeFirst();

    return userToken && mappers.userToken.toDomain(userToken);
  };

  save = async (userToken: UserToken, trx?: Transaction<DB>) => {
    const result = await (trx ?? this.#db)
      .insertInto("userTokens")
      .values(userToken)
      .onConflict((oc) => oc.column("userId").doUpdateSet(userToken))
      .executeTakeFirst();

    return result.numInsertedOrUpdatedRows! > 0n;
  };

  delete = async (userId: UserToken["userId"], trx?: Transaction<DB>) => {
    const result = await (trx ?? this.#db)
      .deleteFrom("userTokens")
      .where("userId", "=", userId)
      .executeTakeFirst();

    return result.numDeletedRows > 0n;
  };
}
