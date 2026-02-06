import type { Kysely, Transaction } from "kysely";

import type { DB, User } from "../../db/types.ts";
import type * as Domain from "../../domain/user.ts";
import { isPgError, PgErrorCode } from "../../lib/pg/error.ts";
import { mappers } from "../../mappers.ts";

export class UserRepoShared {
  #db;
  #tenantId;

  constructor(db: Kysely<DB>, tenantId?: User["id"]) {
    this.#db = db;
    this.#tenantId = tenantId;
  }

  async findByDbId(id: User["id"], trx?: Transaction<DB>) {
    return await this.findById(id as Domain.User["id"], trx);
  }

  async findById(id: Domain.User["id"], trx?: Transaction<DB>) {
    const user = await (trx ?? this.#db)
      .selectFrom("users")
      .where("users.id", "=", id)
      .$if(this.#tenantId != null, (qb) => qb.where("users.id", "=", this.#tenantId!))
      .selectAll("users")
      .$if(trx != null, (qb) => qb.forUpdate())
      .executeTakeFirst();

    return user && mappers.user.toDomain(user);
  }

  async add(user: Domain.User, trx?: Transaction<DB>) {
    if (this.#tenantId != null && user.id !== this.#tenantId) {
      throw new Error("Forbidden");
    }

    const dbUser = mappers.user.toDb(user);

    try {
      const result = await (trx ?? this.#db)
        .insertInto("users") //
        .values(dbUser)
        .executeTakeFirst();

      return result.numInsertedOrUpdatedRows! > 0n ? "Ok" : "Failed";
    } catch (e) {
      if (isPgError(e)) {
        if (e.code === PgErrorCode.UniqueViolation) {
          if (e.constraint?.includes("email")) {
            return "EmailAlreadyExists";
          }
        }
      }

      throw e;
    }
  }

  async update(user: Domain.User, trx?: Transaction<DB>) {
    const dbUser = mappers.user.toDb(user);

    try {
      const result = await (trx ?? this.#db)
        .updateTable("users")
        .set(dbUser)
        .where("id", "=", user.id)
        .$if(this.#tenantId != null, (qb) => qb.where("id", "=", this.#tenantId!))
        .executeTakeFirst();

      return result.numUpdatedRows > 0n ? "Ok" : "NotFound";
    } catch (e) {
      if (isPgError(e)) {
        if (e.code === PgErrorCode.UniqueViolation) {
          if (e.constraint?.includes("email")) {
            return "EmailAlreadyExists";
          }
        }
      }

      throw e;
    }
  }

  async remove(id: Domain.User["id"], trx?: Transaction<DB>) {
    const result = await (trx ?? this.#db)
      .deleteFrom("users")
      .where("id", "=", id)
      .$if(this.#tenantId != null, (qb) => qb.where("id", "=", this.#tenantId!))
      .executeTakeFirst();

    return result.numDeletedRows > 0n ? "Ok" : "NotFound";
  }
}
