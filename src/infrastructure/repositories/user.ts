import type { Transaction } from "kysely";

import { emailAlreadyExistsError } from "../../application/errors/email-already-exists.ts";
import { User as Domain } from "../../domain/entities.ts";
import { entityNotFoundError } from "../../domain/errors/entity-not-found.ts";
import type { IUserRepoForAdmin } from "../../domain/repositories/user/for-admin.ts";
import type { IUserRepoForGuest } from "../../domain/repositories/user/for-guest.ts";
import type { IUserRepoForUser } from "../../domain/repositories/user/for-user.ts";
import { isPgError } from "../../lib/pg-extra.ts";
import { PostgreSQLErrorCode } from "../../lib/postgresql/error-code.ts";
import { UserRole, type DB, type User, type Credential } from "../datasources/db/types.ts";

export class UserRepo implements IUserRepoForAdmin, IUserRepoForUser, IUserRepoForGuest {
  #trx;
  #tenantId;

  constructor(trx: Transaction<DB>, tenantId?: Domain.Type["id"]) {
    this.#trx = trx;
    this.#tenantId = tenantId;
  }

  async add(user: Domain.Type) {
    if (this.#tenantId != null && user.id !== this.#tenantId) {
      throw new Error("forbidden");
    }

    const db = toDb(user);

    try {
      await this.#trx
        .insertInto("users") //
        .values(db.user)
        .execute();
      await this.#trx
        .insertInto("credentials") //
        .values(db.credential)
        .execute();
    } catch (e) {
      if (isPgError(e)) {
        if (e.code === PostgreSQLErrorCode.UniqueViolation) {
          if (e.constraint?.includes("email")) {
            throw emailAlreadyExistsError();
          }
        }
      }
      throw e;
    }
  }

  async update(user: Domain.Type) {
    const db = toDb(user);

    try {
      await this.#trx
        .updateTable("users")
        .set(db.user)
        .where("id", "=", user.id)
        .$if(this.#tenantId != null, (qb) => qb.where("id", "=", this.#tenantId!))
        .returning("id")
        .executeTakeFirstOrThrow(entityNotFoundError);
      await this.#trx
        .updateTable("credentials")
        .set(db.credential)
        .where("userId", "=", user.id)
        .$if(this.#tenantId != null, (qb) => qb.where("userId", "=", this.#tenantId!))
        .returning("userId")
        .executeTakeFirstOrThrow(entityNotFoundError);
    } catch (e) {
      if (isPgError(e)) {
        if (e.code === PostgreSQLErrorCode.UniqueViolation) {
          if (e.constraint?.includes("email")) {
            throw emailAlreadyExistsError();
          }
        }
      }
      throw e;
    }
  }

  async remove(id: Domain.Type["id"]) {
    await this.#trx
      .deleteFrom("users") // CASCADE
      .where("id", "=", id)
      .$if(this.#tenantId != null, (qb) => qb.where("id", "=", this.#tenantId!))
      .returning("id")
      .executeTakeFirstOrThrow(entityNotFoundError);
  }
}

export function toDb({ password, role, ...rest }: Domain.Type): {
  user: User;
  credential: Credential;
} {
  return {
    user: {
      ...rest,
      role: toDbRole[role],
    },
    credential: {
      userId: rest.id,
      password,
    },
  };
}

export const toDbRole: Record<Domain.Type["role"], UserRole> = {
  [Domain.Role.ADMIN]: UserRole.Admin,
  [Domain.Role.USER]: UserRole.User,
};

export function toDomain(user: User, credential: Pick<Credential, "password">): Domain.Type {
  return Domain.parseOrThrow({
    ...user,
    ...credential,
  });
}
