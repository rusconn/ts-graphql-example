import type { Kysely } from "kysely";

import type * as Domain from "../../../../domain/entities.ts";
import type { IUserReaderRepoForUser } from "../../../../domain/repos-for-read/for-user/user.ts";
import type { DB } from "../../../datasources/_shared/types.ts";
import { UserReaderRepoShared } from "../_shared/user.ts";

export class UserReaderRepoForUser implements IUserReaderRepoForUser {
  #shared;

  constructor(db: Kysely<DB>, tenantId: Domain.User.Type["id"]) {
    this.#shared = new UserReaderRepoShared(db, tenantId);
  }

  async find(id: Domain.User.Type["id"]) {
    return await this.#shared.find(id);
  }
}
