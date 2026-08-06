import type { ReadonlyKysely } from "kysely/readonly";

import * as Dto from "../../../application/dto.ts";
import type * as Domain from "../../../domain/entities.ts";
import type { DB } from "../../datasources/db/types.ts";
import * as UserLoader from "./loaders/user.ts";

export class UserQueryShared {
  #loaders;

  constructor(db: ReadonlyKysely<DB>, tenantId?: Domain.User.Type["id"]) {
    this.#loaders = {
      user: UserLoader.create(db, tenantId),
    };
  }

  async find(id: Domain.User.Type["id"]) {
    const user = await this.#loaders.user.load(id);
    return user && Dto.User.parseOrThrow(user);
  }
}
