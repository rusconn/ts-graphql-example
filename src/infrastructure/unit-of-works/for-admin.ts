import type { Kysely, Transaction } from "kysely";

import type {
  IUnitOfWorkForAdmin,
  IUnitOfWorkReposForAdmin,
} from "../../application/unit-of-works/for-admin.ts";
import type * as Domain from "../../domain/entities.ts";
import type { DB } from "../datasources/db/types.ts";
import { RefreshTokenRepoForAdmin } from "../repositories/refresh-token/for-admin.ts";
import { TodoRepoForAdmin } from "../repositories/todo/for-admin.ts";
import { UserRepoForAdmin } from "../repositories/user/for-admin.ts";

export class UnitOfWorkForAdmin implements IUnitOfWorkForAdmin {
  #db;
  #tenantId;

  constructor(db: Kysely<DB>, tenantId: Domain.User.Type["id"]) {
    this.#db = db;
    this.#tenantId = tenantId;
  }

  async run<T>(work: (repos: IUnitOfWorkReposForAdmin) => Promise<T>): Promise<T> {
    if (this.#db.isTransaction) {
      return await work({
        refreshToken: new RefreshTokenRepoForAdmin(this.#db as Transaction<DB>, this.#tenantId),
        todo: new TodoRepoForAdmin(this.#db as Transaction<DB>, this.#tenantId),
        user: new UserRepoForAdmin(this.#db as Transaction<DB>, this.#tenantId),
      });
    }

    return await this.#db.transaction().execute(async (trx) => {
      return await work({
        refreshToken: new RefreshTokenRepoForAdmin(trx, this.#tenantId),
        todo: new TodoRepoForAdmin(trx, this.#tenantId),
        user: new UserRepoForAdmin(trx, this.#tenantId),
      });
    });
  }
}
