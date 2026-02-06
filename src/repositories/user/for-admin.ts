import type { Kysely, Transaction } from "kysely";

import type * as Db from "../../db/types.ts";
import type { DB, User } from "../../db/types.ts";
import type * as Domain from "../../domain/user.ts";
import { UserRepoShared } from "./shared.ts";

export class UserRepoForAdmin {
  #shared;

  constructor(db: Kysely<DB>, tenantId: Db.User["id"]) {
    this.#shared = new UserRepoShared(db, tenantId);
  }

  async findByDbId(id: User["id"], trx?: Transaction<DB>) {
    return await this.#shared.findByDbId(id, trx);
  }

  async save(user: Domain.User, trx?: Transaction<DB>) {
    return await this.#shared.save(user, trx);
  }

  async delete(id: Domain.User["id"], trx?: Transaction<DB>) {
    return await this.#shared.delete(id, trx);
  }
}
