import type { Kysely, Transaction } from "kysely";

import type {
  IUnitOfWorkForUser,
  IUnitOfWorkReposForUser,
} from "../../application/unit-of-works/for-user.ts";
import type * as Domain from "../../domain/entities.ts";
import type { DB } from "../datasources/db/types.ts";
import { RefreshTokenRepoForUser } from "../repositories/refresh-token/for-user.ts";
import { TodoRepoForUser } from "../repositories/todo/for-user.ts";
import { UserRepoForUser } from "../repositories/user/for-user.ts";

export class UnitOfWorkForUser implements IUnitOfWorkForUser {
  #db;
  #tenantId;

  constructor(db: Kysely<DB>, tenantId: Domain.User.Type["id"]) {
    this.#db = db;
    this.#tenantId = tenantId;
  }

  async run<T>(work: (repos: IUnitOfWorkReposForUser) => Promise<T>): Promise<T> {
    if (this.#db.isTransaction) {
      return await work({
        refreshToken: new RefreshTokenRepoForUser(this.#db as Transaction<DB>, this.#tenantId),
        todo: new TodoRepoForUser(this.#db as Transaction<DB>, this.#tenantId),
        user: new UserRepoForUser(this.#db as Transaction<DB>, this.#tenantId),
      });
    }

    return await this.#db.transaction().execute(async (trx) => {
      return await work({
        refreshToken: new RefreshTokenRepoForUser(trx, this.#tenantId),
        todo: new TodoRepoForUser(trx, this.#tenantId),
        user: new UserRepoForUser(trx, this.#tenantId),
      });
    });
  }
}
