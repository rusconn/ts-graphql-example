import type { Transaction } from "kysely";

import type * as Domain from "../../../../domain/models.ts";
import type { IUserRepoForAdmin } from "../../../../domain/unit-of-works/for-admin/user.ts";
import type { DB } from "../../../datasources/_shared/types.ts";
import { UserRepoShared } from "../_shared/user.ts";

export class UserRepoForAdmin implements IUserRepoForAdmin {
  #shared;

  constructor(trx: Transaction<DB>, tenantId: Domain.User.Type["id"]) {
    this.#shared = new UserRepoShared(trx, tenantId);
  }

  async add(user: Domain.User.Type) {
    return await this.#shared.add(user);
  }

  async update(user: Domain.User.Type) {
    return await this.#shared.update(user);
  }

  async remove(id: Domain.User.Type["id"]) {
    return await this.#shared.remove(id);
  }
}
