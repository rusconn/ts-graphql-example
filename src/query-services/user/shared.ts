import type { Kysely } from "kysely";

import type { DB, User, UserToken } from "../../db/types.ts";
import * as UserLoader from "./loaders/user.ts";

export class UserQueryShared {
  #db;
  #loaders;
  #tenantId;

  constructor(db: Kysely<DB>, tenantId?: User["id"]) {
    this.#db = db;
    this.#loaders = {
      user: UserLoader.create(db, tenantId),
    };
    this.#tenantId = tenantId;
  }

  async findById(id: User["id"]) {
    const user = await this.#db
      .selectFrom("users")
      .where("id", "=", id)
      .$if(this.#tenantId != null, (qb) => qb.where("id", "=", this.#tenantId!))
      .selectAll()
      .executeTakeFirst();

    return user;
  }

  async findByRefreshToken(refreshToken: UserToken["refreshToken"]) {
    const user = await this.#db
      .selectFrom("users")
      .innerJoin("userTokens", "users.id", "userTokens.userId")
      .where("refreshToken", "=", refreshToken)
      .$if(this.#tenantId != null, (qb) => qb.where("users.id", "=", this.#tenantId!))
      .selectAll("users")
      .executeTakeFirst();

    return user;
  }

  async load(key: UserLoader.Key) {
    return await this.#loaders.user.load(key);
  }
}
