import type { Kysely, Transaction } from "kysely";

import {
  type Credential,
  type DB,
  type User,
  UserRole,
} from "../../../datasources/_shared/types.ts";
import { User as Domain } from "../../../../domain/models.ts";
import { entityNotFoundError } from "../../../../domain/repos/_shared/errors.ts";
import { emailAlreadyExistsError } from "../../../../domain/repos/user/errors.ts";
import { isPgError, PgErrorCode } from "../../../../lib/pg/error.ts";

export class UserRepoShared {
  #db;
  #tenantId;

  constructor(db: Kysely<DB>, tenantId?: User["id"]) {
    this.#db = db;
    this.#tenantId = tenantId;
  }

  async findByDbId(id: User["id"], trx?: Transaction<DB>) {
    return await this.findById(id as Domain.Type["id"], trx);
  }

  async findById(id: Domain.Type["id"], trx?: Transaction<DB>) {
    const result = await (trx ?? this.#db)
      .selectFrom("users")
      .innerJoin("credentials", "users.id", "credentials.userId")
      .where("users.id", "=", id)
      .$if(this.#tenantId != null, (qb) => qb.where("users.id", "=", this.#tenantId!))
      .select([
        "users.id as usersId",
        "users.name as usersName",
        "users.email as usersEmail",
        "users.role as usersRole",
        "users.createdAt as usersCreatedAt",
        "users.updatedAt as usersUpdatedAt",
      ])
      .select(["credentials.password as credentialsPassword"])
      .$if(trx != null, (qb) => qb.forUpdate())
      .executeTakeFirst();

    if (result == null) {
      return undefined;
    }

    const user: User = {
      id: result.usersId,
      name: result.usersName,
      email: result.usersEmail,
      role: result.usersRole,
      createdAt: result.usersCreatedAt,
      updatedAt: result.usersUpdatedAt,
    };
    const credential: Pick<Credential, "password"> = {
      password: result.credentialsPassword,
    };

    return toDomain(user, credential);
  }

  async add(user: Domain.Type, trx?: Transaction<DB>) {
    if (this.#tenantId != null && user.id !== this.#tenantId) {
      throw new Error("forbidden");
    }

    if (trx) {
      await this.#addCore(user, trx);
    } else {
      await this.#db.transaction().execute(async (trx) => {
        await this.#addCore(user, trx);
      });
    }
  }

  async #addCore(user: Domain.Type, trx: Transaction<DB>) {
    const db = toDb(user);

    try {
      await trx
        .insertInto("users") //
        .values(db.user)
        .execute();
      await trx
        .insertInto("credentials") //
        .values(db.credential)
        .execute();
    } catch (e) {
      if (isPgError(e)) {
        if (e.code === PgErrorCode.UniqueViolation) {
          if (e.constraint?.includes("email")) {
            throw emailAlreadyExistsError();
          }
        }
      }
      throw e;
    }
  }

  async update(user: Domain.Type, trx?: Transaction<DB>) {
    if (trx) {
      await this.#updateCore(user, trx);
    } else {
      await this.#db.transaction().execute(async (trx) => {
        await this.#updateCore(user, trx);
      });
    }
  }

  async #updateCore(user: Domain.Type, trx: Transaction<DB>) {
    const db = toDb(user);

    try {
      await trx
        .updateTable("users")
        .set(db.user)
        .where("id", "=", user.id)
        .$if(this.#tenantId != null, (qb) => qb.where("id", "=", this.#tenantId!))
        .returning("id")
        .executeTakeFirstOrThrow(entityNotFoundError);
      await trx
        .updateTable("credentials")
        .set(db.credential)
        .where("userId", "=", user.id)
        .$if(this.#tenantId != null, (qb) => qb.where("userId", "=", this.#tenantId!))
        .returning("userId")
        .executeTakeFirstOrThrow(entityNotFoundError);
    } catch (e) {
      if (isPgError(e)) {
        if (e.code === PgErrorCode.UniqueViolation) {
          if (e.constraint?.includes("email")) {
            throw emailAlreadyExistsError();
          }
        }
      }
      throw e;
    }
  }

  async remove(id: Domain.Type["id"], trx?: Transaction<DB>) {
    await (trx ?? this.#db)
      .deleteFrom("users") // CASCADE
      .where("id", "=", id)
      .$if(this.#tenantId != null, (qb) => qb.where("id", "=", this.#tenantId!))
      .returning("id")
      .executeTakeFirstOrThrow(entityNotFoundError);
  }
}

const toDb = ({ password, role, ...rest }: Domain.Type): { user: User; credential: Credential } => {
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
};

const toDbRole: Record<Domain.Type["role"], UserRole> = {
  [Domain.Role.ADMIN]: UserRole.Admin,
  [Domain.Role.USER]: UserRole.User,
};

export const toDomain = (user: User, credential: Pick<Credential, "password">): Domain.Type => {
  return Domain.parseOrThrow({
    ...user,
    ...credential,
    role: toDomainRole[user.role],
  });
};

const toDomainRole: Record<UserRole, Domain.Type["role"]> = {
  [UserRole.Admin]: Domain.Role.ADMIN,
  [UserRole.User]: Domain.Role.USER,
};
