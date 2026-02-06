import type { Kysely, Transaction } from "kysely";

import type { DB, User, UserCredential } from "../../db/types.ts";
import type * as Domain from "../../domain/user-credential.ts";
import { mappers } from "../../mappers.ts";

export class UserCredentialRepoShared {
  #db;
  #tenantId;

  constructor(db: Kysely<DB>, tenantId?: User["id"]) {
    this.#db = db;
    this.#tenantId = tenantId;
  }

  async findByDbId(id: UserCredential["userId"], trx?: Transaction<DB>) {
    const credential = await (trx ?? this.#db)
      .selectFrom("userCredentials")
      .where("userId", "=", id)
      .$if(this.#tenantId != null, (qb) => qb.where("userId", "=", this.#tenantId!))
      .selectAll()
      .$if(trx != null, (qb) => qb.forUpdate())
      .executeTakeFirst();

    return credential && mappers.userCredential.toDomain(credential);
  }

  async findByDbEmail(email: User["email"], trx?: Transaction<DB>) {
    const credential = await (trx ?? this.#db)
      .selectFrom("userCredentials")
      .innerJoin("users", "userCredentials.userId", "users.id")
      .where("email", "=", email)
      .$if(this.#tenantId != null, (qb) => qb.where("userCredentials.userId", "=", this.#tenantId!))
      .selectAll("userCredentials")
      .$if(trx != null, (qb) => qb.forUpdate())
      .executeTakeFirst();

    return credential && mappers.userCredential.toDomain(credential);
  }

  async add(credential: Domain.UserCredential, trx?: Transaction<DB>) {
    if (this.#tenantId != null && credential.id !== this.#tenantId) {
      throw new Error("Forbidden");
    }

    const dbCredential = mappers.userCredential.toDb(credential);

    const result = await (trx ?? this.#db)
      .insertInto("userCredentials") //
      .values(dbCredential)
      .executeTakeFirst();

    return result.numInsertedOrUpdatedRows! > 0n ? "Ok" : "Failed";
  }

  async update(credential: Domain.UserCredential, trx?: Transaction<DB>) {
    const dbCredential = mappers.userCredential.toDb(credential);

    const result = await (trx ?? this.#db)
      .updateTable("userCredentials")
      .set(dbCredential)
      .where("userId", "=", dbCredential.userId)
      .$if(this.#tenantId != null, (qb) => qb.where("userId", "=", this.#tenantId!))
      .executeTakeFirst();

    return result.numUpdatedRows > 0n ? "Ok" : "NotFound";
  }

  async remove(id: Domain.UserCredential["id"], trx?: Transaction<DB>) {
    const result = await (trx ?? this.#db)
      .deleteFrom("userCredentials")
      .where("userId", "=", id)
      .$if(this.#tenantId != null, (qb) => qb.where("userId", "=", this.#tenantId!))
      .executeTakeFirst();

    return result.numDeletedRows > 0n ? "Ok" : "NotFound";
  }
}
