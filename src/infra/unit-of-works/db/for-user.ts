import type { Kysely } from "kysely";

import type * as Domain from "../../../domain/entities.ts";
import type {
  IUnitOfWorkForUser,
  IUnitOfWorkReposForUser,
} from "../../../domain/unit-of-works/for-user.ts";
import type { DB } from "../../datasources/_shared/generated.ts";
import { RefreshTokenRepoForUser } from "./for-user/refresh-token.ts";
import { TodoRepoForUser } from "./for-user/todo.ts";
import { UserRepoForUser } from "./for-user/user.ts";

export class UnitOfWorkForUser implements IUnitOfWorkForUser {
  #db;
  #tenantId;

  constructor(db: Kysely<DB>, tenantId: Domain.User.Type["id"]) {
    this.#db = db;
    this.#tenantId = tenantId;
  }

  async run<T>(work: (repos: IUnitOfWorkReposForUser) => Promise<T>): Promise<T> {
    return await this.#db.transaction().execute(async (trx) => {
      return await work({
        refreshToken: new RefreshTokenRepoForUser(trx, this.#tenantId),
        todo: new TodoRepoForUser(trx, this.#tenantId),
        user: new UserRepoForUser(trx, this.#tenantId),
      });
    });
  }
}
