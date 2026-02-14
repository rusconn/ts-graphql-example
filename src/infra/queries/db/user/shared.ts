import type { Kysely } from "kysely";

import type * as Domain from "../../../../domain/models.ts";
import * as Dto from "../../../../graphql/_dto.ts";
import type { DB } from "../../../datasources/_shared/types.ts";
import * as UserLoader from "./loaders/user.ts";

export class UserQueryShared {
  #db;
  #loaders;
  #tenantId;

  constructor(db: Kysely<DB>, tenantId?: Domain.User.Type["id"]) {
    this.#db = db;
    this.#loaders = {
      user: UserLoader.create(db, tenantId),
    };
    this.#tenantId = tenantId;
  }

  async find(id: Domain.User.Type["id"]) {
    const user = await this.#db
      .selectFrom("users")
      .where("id", "=", id)
      .$if(this.#tenantId != null, (qb) => qb.where("id", "=", this.#tenantId!))
      .selectAll()
      .executeTakeFirst();

    return user && Dto.User.parseOrThrow(user);
  }

  async findByRefreshToken(token: Domain.RefreshToken.Type["token"]) {
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
