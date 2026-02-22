import type { Kysely } from "kysely";

import type { User as Domain } from "../../../../domain/entities.ts";
import type { Credential, DB, User } from "../../../datasources/_shared/types.ts";
import { toDomain } from "../../../unit-of-works/db/_shared/user.ts";

export class UserReaderRepoShared {
  #db;
  #tenantId;

  constructor(db: Kysely<DB>, tenantId?: Domain.Type["id"]) {
    this.#db = db;
    this.#tenantId = tenantId;
  }

  async find(id: Domain.Type["id"]) {
    return await this._find({ id });
  }

  async findByEmail(email: Domain.Type["email"]) {
    return await this._find({ email });
  }

  async _find(filter: Partial<Pick<Domain.Type, "id" | "email">>) {
    const result = await this.#db
      .selectFrom("users")
      .innerJoin("credentials", "users.id", "credentials.userId")
      .$if(filter.id != null, (qb) => qb.where("users.id", "=", filter.id!))
      .$if(filter.email != null, (qb) => qb.where("users.email", "=", filter.email!))
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
}
