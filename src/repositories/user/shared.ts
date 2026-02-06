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

  // TODO: split save into (create, update)
  async save(user: Domain.User, trx?: Transaction<DB>) {
    try {
      const result = await this.#saveCore(user, trx);
      return { type: result } as const;
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

  async #saveCore(user: Domain.User, trx?: Transaction<DB>) {
    const found = await this.findById(user.id, trx);

    return found
      ? await this.#update(user, trx) //
      : await this.#create(user, trx);
  }

  async #create(user: Domain.User, trx?: Transaction<DB>) {
    if (this.#tenantId != null && user.id !== this.#tenantId) {
      return "Forbidden";
    }

    const dbUser = mappers.user.toDb(user);

    await (trx ?? this.#db)
      .insertInto("users") //
      .values(dbUser)
      .executeTakeFirstOrThrow();

    return "Ok";
  }

  async #update(user: Domain.User, trx?: Transaction<DB>) {
    const dbUser = mappers.user.toDb(user);

    const result = await (trx ?? this.#db)
      .updateTable("users")
      .set(dbUser)
      .where("id", "=", user.id)
      .$if(this.#tenantId != null, (qb) => qb.where("id", "=", this.#tenantId!))
      .executeTakeFirst();

    return result.numUpdatedRows > 0n ? "Ok" : "NotFound";
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
