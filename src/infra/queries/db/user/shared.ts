import type { Kysely } from "kysely";

import * as Dto from "../../../../application/queries/dto.ts";
import type * as Domain from "../../../../domain/entities.ts";
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

  async load(key: UserLoader.Key) {
    const user = await this.#loaders.user.load(key);
    return user && Dto.User.parseOrThrow(user);
  }
}
