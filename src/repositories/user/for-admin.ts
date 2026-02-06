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

  async add(user: Domain.User, trx?: Transaction<DB>) {
    return await this.#shared.add(user, trx);
  }

  async update(user: Domain.User, trx?: Transaction<DB>) {
    return await this.#shared.update(user, trx);
  }

  async remove(id: Domain.User["id"], trx?: Transaction<DB>) {
    return await this.#shared.remove(id, trx);
  }
}
