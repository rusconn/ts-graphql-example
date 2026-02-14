import type { Kysely } from "kysely";

import type * as Domain from "../../../../domain/models.ts";
import type { IUserReaderRepoForAdmin } from "../../../../domain/repos-for-read/for-admin/user.ts";
import type { DB } from "../../../datasources/_shared/types.ts";
import { UserRepoShared } from "../_shared/user.ts";

export class UserReaderRepoForAdmin implements IUserReaderRepoForAdmin {
  #shared;

  constructor(db: Kysely<DB>, tenantId: Domain.User.Type["id"]) {
    this.#shared = new UserRepoShared(db, tenantId);
  }

  async find(id: Domain.User.Type["id"]) {
    return await this.#shared.find(id);
  }
}
