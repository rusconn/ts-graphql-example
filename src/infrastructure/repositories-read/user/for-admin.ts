import type { ReadonlyKysely } from "kysely/readonly";

import type * as Domain from "../../../domain/entities.ts";
import type { IUserReaderRepoForAdmin } from "../../../domain/repositories-read/user/for-admin.ts";
import type { DB } from "../../datasources/db/types.ts";
import { UserReaderRepoShared } from "./shared.ts";

export class UserReaderRepoForAdmin implements IUserReaderRepoForAdmin {
  #shared;

  constructor(db: ReadonlyKysely<DB>, tenantId: Domain.User.Type["id"]) {
    this.#shared = new UserReaderRepoShared(db, tenantId);
  }

  async find(id: Domain.User.Type["id"]) {
    return await this.#shared.find(id);
  }

  async findByEmail(email: Domain.User.Type["email"]) {
    return await this.#shared.findByEmail(email);
  }
}
