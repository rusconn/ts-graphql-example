import type { Kysely, Transaction } from "kysely";

import type { DB, User, Credential } from "../../db/types.ts";
import type * as Domain from "../../domain.ts";

export class CredentialRepoShared {
  #db;
  #tenantId;

  constructor(db: Kysely<DB>, tenantId?: User["id"]) {
    this.#db = db;
    this.#tenantId = tenantId;
  }

  async findByDbId(id: Credential["userId"], trx?: Transaction<DB>) {
    const credential = await (trx ?? this.#db)
      .selectFrom("credentials")
      .where("userId", "=", id)
      .$if(this.#tenantId != null, (qb) => qb.where("userId", "=", this.#tenantId!))
      .selectAll()
      .$if(trx != null, (qb) => qb.forUpdate())
      .executeTakeFirst();

    return credential && toDomain(credential);
  }

  async findByDbEmail(email: User["email"], trx?: Transaction<DB>) {
    const credential = await (trx ?? this.#db)
      .selectFrom("credentials")
      .innerJoin("users", "credentials.userId", "users.id")
      .where("email", "=", email)
      .$if(this.#tenantId != null, (qb) => qb.where("credentials.userId", "=", this.#tenantId!))
      .selectAll("credentials")
      .$if(trx != null, (qb) => qb.forUpdate())
      .executeTakeFirst();

    return credential && toDomain(credential);
  }

  async add(credential: Domain.Credential.Type, trx?: Transaction<DB>) {
    if (this.#tenantId != null && credential.id !== this.#tenantId) {
      throw new Error("Forbidden");
    }

    const dbCredential = toDb(credential);

    const result = await (trx ?? this.#db)
      .insertInto("credentials") //
      .values(dbCredential)
      .executeTakeFirst();

    return result.numInsertedOrUpdatedRows! > 0n ? "Ok" : "Failed";
  }

  async update(credential: Domain.Credential.Type, trx?: Transaction<DB>) {
    const dbCredential = toDb(credential);

    const result = await (trx ?? this.#db)
      .updateTable("credentials")
      .set(dbCredential)
      .where("userId", "=", dbCredential.userId)
      .$if(this.#tenantId != null, (qb) => qb.where("userId", "=", this.#tenantId!))
      .executeTakeFirst();

    return result.numUpdatedRows > 0n ? "Ok" : "NotFound";
  }

  async remove(id: Domain.Credential.Type["id"], trx?: Transaction<DB>) {
    const result = await (trx ?? this.#db)
      .deleteFrom("credentials")
      .where("userId", "=", id)
      .$if(this.#tenantId != null, (qb) => qb.where("userId", "=", this.#tenantId!))
      .executeTakeFirst();

    return result.numDeletedRows > 0n ? "Ok" : "NotFound";
  }
}

const toDb = ({ id, ...rest }: Domain.Credential.Type): Credential => ({
  ...rest,
  userId: id,
});

const toDomain = ({ userId, password }: Credential): Domain.Credential.Type => ({
  id: userId as Domain.Credential.Type["id"],
  password: password as Domain.Credential.Type["password"],
});
