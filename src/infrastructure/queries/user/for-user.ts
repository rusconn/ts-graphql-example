import type { ReadonlyKysely } from "kysely/readonly";

import type { IUserQueryForUser } from "../../../application/queries/user/for-user.ts";
import type * as Domain from "../../../domain/entities.ts";
import type { DB } from "../../datasources/db/types.ts";
import { UserQueryShared } from "./shared.ts";

export class UserQueryForUser implements IUserQueryForUser {
  #shared;

  constructor(db: ReadonlyKysely<DB>, tenantId: Domain.User.Type["id"]) {
    this.#shared = new UserQueryShared(db, tenantId);
  }

  async find(id: Domain.User.Type["id"]) {
    return await this.#shared.find(id);
  }
}
