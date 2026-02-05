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
      .innerJoin("userCredentials", "users.id", "userCredentials.userId")
      .where("users.id", "=", id)
      .$if(this.#tenantId != null, (qb) => qb.where("users.id", "=", this.#tenantId!))
      .selectAll("users")
      .select("userCredentials.password")
      .$if(trx != null, (qb) => qb.forUpdate())
      .executeTakeFirst();

    return user && mappers.user.toDomain(user);
  }

  async findByEmail(email: Domain.User["email"], trx?: Transaction<DB>) {
    const user = await (trx ?? this.#db)
      .selectFrom("users")
      .innerJoin("userCredentials", "users.id", "userCredentials.userId")
      .where("email", "=", email)
      .$if(this.#tenantId != null, (qb) => qb.where("users.id", "=", this.#tenantId!))
      .selectAll("users")
      .select("userCredentials.password")
      .$if(trx != null, (qb) => qb.forUpdate())
      .executeTakeFirst();

    return user && mappers.user.toDomain(user);
  }

  // TODO: split save into (create, update)
  async save(user: Domain.User, trx?: Transaction<DB>) {
    try {
      if (trx) {
        const result = await this.#saveCore(trx, user);
        return { type: result } as const;
      } else {
        const result = await this.#db.transaction().execute(async (trx) => {
          return await this.#saveCore(trx, user);
        });
        return { type: result } as const;
      }
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

  async #saveCore(trx: Transaction<DB>, user: Domain.User) {
    const found = await this.findByDbId(user.id, trx);

    return found
      ? await this.#update(trx, user) //
      : await this.#create(trx, user);
  }

  async #create(trx: Transaction<DB>, user: Domain.User) {
    if (this.#tenantId != null && user.id !== this.#tenantId) {
      return "Forbidden";
    }

    const db = mappers.user.toDb(user);

    await trx
      .insertInto("users") //
      .values(db.user)
      .executeTakeFirstOrThrow();
    await trx
      .insertInto("userCredentials") //
      .values(db.userCredential)
      .executeTakeFirstOrThrow();

    return "Ok";
  }

  async #update(trx: Transaction<DB>, user: Domain.User) {
    const db = mappers.user.toDb(user);

    const result1 = await trx
      .updateTable("users")
      .set(db.user)
      .where("id", "=", user.id)
      .$if(this.#tenantId != null, (qb) => qb.where("id", "=", this.#tenantId!))
      .executeTakeFirst();
    const result2 = await trx
      .updateTable("userCredentials")
      .set(db.userCredential)
      .where("userId", "=", user.id)
      .$if(this.#tenantId != null, (qb) => qb.where("userId", "=", this.#tenantId!))
      .executeTakeFirst();

    const updated = (result1.numUpdatedRows + result2.numUpdatedRows) as 0n | 1n | 2n;

    switch (updated) {
      case 0n:
        return "NotFound";
      case 1n:
        throw new Error("to rollback");
      case 2n:
        return "Ok";
      default:
        throw new Error(updated satisfies never);
    }
  }

  async delete(id: Domain.User["id"], trx?: Transaction<DB>) {
    const result = await (trx ?? this.#db)
      .deleteFrom("users")
      .where("id", "=", id)
      .$if(this.#tenantId != null, (qb) => qb.where("id", "=", this.#tenantId!))
      .executeTakeFirst();

    return result.numDeletedRows > 0n ? "Ok" : "NotFound";
  }
}
