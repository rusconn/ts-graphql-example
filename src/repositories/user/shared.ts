import type { Kysely, Transaction } from "kysely";

import { type DB, type User, UserRole } from "../../db/types.ts";
import * as Domain from "../../domain/user.ts";
import { isPgError, PgErrorCode } from "../../lib/pg/error.ts";

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

    return user && toDomain(user);
  }

  async add(user: Domain.User, trx?: Transaction<DB>) {
    if (this.#tenantId != null && user.id !== this.#tenantId) {
      throw new Error("Forbidden");
    }

    const dbUser = toDb(user);

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
    const dbUser = toDb(user);

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

const toDb = ({ id, role, ...rest }: Domain.User): User => ({
  ...rest,
  id,
  role: {
    [Domain.UserRole.ADMIN]: UserRole.Admin,
    [Domain.UserRole.USER]: UserRole.User,
  }[role],
});

const toDomain = ({ id, email, role, ...rest }: User): Domain.User => ({
  ...rest,
  id: id as Domain.User["id"],
  email: email as Domain.User["email"],
  role: {
    [UserRole.Admin]: Domain.UserRole.ADMIN,
    [UserRole.User]: Domain.UserRole.USER,
  }[role],
});
