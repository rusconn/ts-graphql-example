import type { Kysely, Transaction } from "kysely";

import type * as Db from "../../db/types.ts";
import type { DB } from "../../db/types.ts";
import type * as Domain from "../../domain/user.ts";
import { isPgError, PgErrorCode } from "../../lib/pg/error.ts";
import { mappers } from "../../mappers.ts";

export class UserRepoShared {
  #db;

  constructor(db: Kysely<DB>) {
    this.#db = db;
  }

  async findByDbId(id: Db.User["id"], trx?: Transaction<DB>) {
    return await this.findById(id as Domain.User["id"], trx);
  }

  async findById(id: Domain.User["id"], trx?: Transaction<DB>) {
    const user = await (trx ?? this.#db)
      .selectFrom("userCredentials")
      .innerJoin("users", "userCredentials.userId", "users.id")
      .where("id", "=", id)
      .selectAll("users")
      .select("userCredentials.password")
      .$if(trx != null, (qb) => qb.forUpdate())
      .executeTakeFirst();

    return user && mappers.user.toDomain(user);
  }

  async findByEmail(email: Domain.User["email"], trx?: Transaction<DB>) {
    const user = await (trx ?? this.#db)
      .selectFrom("userCredentials")
      .innerJoin("users", "userCredentials.userId", "users.id")
      .where("email", "=", email)
      .selectAll("users")
      .select("userCredentials.password")
      .$if(trx != null, (qb) => qb.forUpdate())
      .executeTakeFirst();

    return user && mappers.user.toDomain(user);
  }

  async save(user: Domain.User, trx?: Transaction<DB>) {
    const db = mappers.user.toDb(user);

    try {
      if (trx) {
        await this.#saveCore(trx, db.user, db.userCredential);
      } else {
        await this.#db.transaction().execute(async (trx) => {
          await this.#saveCore(trx, db.user, db.userCredential);
        });
      }

      return { type: "Success" } as const;
    } catch (e) {
      if (isPgError(e)) {
        if (e.code === PgErrorCode.UniqueViolation) {
          if (e.constraint?.includes("email")) {
            return { type: "EmailAlreadyExists" } as const;
          }
        }
      }

      return {
        type: "Unknown",
        e: Error.isError(e) ? e : new Error("unknown", { cause: e }),
      } as const;
    }
  }

  async #saveCore(trx: Transaction<DB>, user: Db.User, userCredential: Db.UserCredential) {
    await trx
      .insertInto("users")
      .values(user)
      .onConflict((oc) => oc.column("id").doUpdateSet(user))
      .executeTakeFirstOrThrow();
    await trx
      .insertInto("userCredentials")
      .values(userCredential)
      .onConflict((oc) => oc.column("userId").doUpdateSet(userCredential))
      .executeTakeFirstOrThrow();
  }

  async delete(id: Domain.User["id"], trx?: Transaction<DB>) {
    const result = await (trx ?? this.#db)
      .deleteFrom("users")
      .where("id", "=", id)
      .executeTakeFirst();

    return result.numDeletedRows > 0n;
  }
}
