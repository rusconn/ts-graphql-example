import type { Kysely } from "kysely";

import type * as Domain from "../../../domain/entities.ts";
import type {
  IUnitOfWorkForAdmin,
  IUnitOfWorkReposForAdmin,
} from "../../../domain/unit-of-works/for-admin.ts";
import type { DB } from "../../datasources/_shared/generated.ts";
import { RefreshTokenRepoForAdmin } from "./for-admin/refresh-token.ts";
import { TodoRepoForAdmin } from "./for-admin/todo.ts";
import { UserRepoForAdmin } from "./for-admin/user.ts";

export class UnitOfWorkForAdmin implements IUnitOfWorkForAdmin {
  #db;
  #tenantId;

  constructor(db: Kysely<DB>, tenantId: Domain.User.Type["id"]) {
    this.#db = db;
    this.#tenantId = tenantId;
  }

  async run<T>(work: (repos: IUnitOfWorkReposForAdmin) => Promise<T>): Promise<T> {
    return await this.#db.transaction().execute(async (trx) => {
      return await work({
        refreshToken: new RefreshTokenRepoForAdmin(trx, this.#tenantId),
        todo: new TodoRepoForAdmin(trx, this.#tenantId),
        user: new UserRepoForAdmin(trx, this.#tenantId),
      });
    });
  }
}
