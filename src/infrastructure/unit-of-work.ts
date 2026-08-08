import type { Kysely, Transaction } from "kysely";

import type { IUnitOfWorkForAdmin } from "../application/unit-of-works/for-admin.ts";
import type { IUnitOfWorkForGuest } from "../application/unit-of-works/for-guest.ts";
import type { IUnitOfWorkForUser } from "../application/unit-of-works/for-user.ts";
import type * as Domain from "../domain/entities.ts";
import type { DB } from "./datasources/db/types.ts";
import { RefreshTokenRepo } from "./repositories/refresh-token.ts";
import { TodoRepo } from "./repositories/todo.ts";
import { UserRepo } from "./repositories/user.ts";

type UnitOfWorkRepos = {
  refreshToken: RefreshTokenRepo;
  todo: TodoRepo;
  user: UserRepo;
};

export class UnitOfWork implements IUnitOfWorkForAdmin, IUnitOfWorkForUser, IUnitOfWorkForGuest {
  #db;
  #tenantId;

  constructor(db: Kysely<DB>, tenantId?: Domain.User.Type["id"]) {
    this.#db = db;
    this.#tenantId = tenantId;
  }

  async run<T>(work: (repos: UnitOfWorkRepos) => Promise<T>): Promise<T> {
    const run = (trx: Transaction<DB>) =>
      work({
        refreshToken: new RefreshTokenRepo(trx, this.#tenantId),
        todo: new TodoRepo(trx, this.#tenantId),
        user: new UserRepo(trx, this.#tenantId),
      });

    if (this.#db.isTransaction) {
      return await run(this.#db as Transaction<DB>);
    }

    return await this.#db.transaction().execute(run);
  }
}
