import type { Kysely, Transaction } from "kysely";

import type * as Db from "../../../datasources/_shared/types.ts";
import type { DB, User } from "../../../datasources/_shared/types.ts";
import type * as Domain from "../../../../domain/models.ts";
import type { IUserRepoForUser } from "../../../../domain/repos/user/for-user.ts";
import { UserRepoShared } from "./shared.ts";

export class UserRepoForUser implements IUserRepoForUser {
  #shared;

  constructor(db: Kysely<DB>, tenantId: Db.User["id"]) {
    this.#shared = new UserRepoShared(db, tenantId);
  }

  async find(id: User["id"], trx?: Transaction<DB>) {
    return await this.#shared.findByDbId(id, trx);
  }

  async add(user: Domain.User.Type, trx?: Transaction<DB>) {
    return await this.#shared.add(user, trx);
  }

  async update(user: Domain.User.Type, trx?: Transaction<DB>) {
    return await this.#shared.update(user, trx);
  }

  async remove(id: Domain.User.Type["id"], trx?: Transaction<DB>) {
    return await this.#shared.remove(id, trx);
  }
}
