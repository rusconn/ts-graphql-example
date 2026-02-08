import type { Kysely } from "kysely";

import type { DB, RefreshToken, User } from "../../../datasources/_shared/types.ts";
import * as Dto from "../../../../graphql/_dto.ts";
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

    return user && Dto.User.parseOrThrow(user);
  }

  async findByRefreshToken(token: RefreshToken["token"]) {
    const user = await this.#db
      .selectFrom("users")
      .innerJoin("refreshTokens", "users.id", "refreshTokens.userId")
      .where("token", "=", token)
      .$if(this.#tenantId != null, (qb) => qb.where("users.id", "=", this.#tenantId!))
      .selectAll("users")
      .executeTakeFirst();

    return user && Dto.User.parseOrThrow(user);
  }

  async load(key: UserLoader.Key) {
    const user = await this.#loaders.user.load(key);
    return user && Dto.User.parseOrThrow(user);
  }
}
