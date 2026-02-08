import type { Kysely, Transaction } from "kysely";

import type { DB } from "../../../datasources/_shared/types.ts";
import type * as Domain from "../../../../domain/models.ts";
import type { IUserRepoForAdmin } from "../../../../domain/repos/user/for-admin.ts";
import { UserRepoShared } from "./shared.ts";

export class UserRepoForAdmin implements IUserRepoForAdmin {
  #shared;

  constructor(db: Kysely<DB>, tenantId: Domain.User.Type["id"]) {
    this.#shared = new UserRepoShared(db, tenantId);
  }

  async find(id: Domain.User.Type["id"], trx?: Transaction<DB>) {
    return await this.#shared.find(id, trx);
  }

  async add(user: Domain.User.Type, trx: Transaction<DB>) {
    return await this.#shared.add(user, trx);
  }

  async update(user: Domain.User.Type, trx: Transaction<DB>) {
    return await this.#shared.update(user, trx);
  }

  async remove(id: Domain.User.Type["id"], trx: Transaction<DB>) {
    return await this.#shared.remove(id, trx);
  }
}
