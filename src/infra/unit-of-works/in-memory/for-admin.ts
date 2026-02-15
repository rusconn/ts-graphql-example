import type * as Domain from "../../../domain/entities.ts";
import type {
  IUnitOfWorkForAdmin,
  IUnitOfWorkReposForAdmin,
} from "../../../domain/unit-of-works/for-admin.ts";
import type { InMemoryDb } from "../../datasources/in-memory/store.ts";
import { RefreshTokenRepoForAdmin } from "./for-admin/refresh-token.ts";
import { TodoRepoForAdmin } from "./for-admin/todo.ts";
import { UserRepoForAdmin } from "./for-admin/user.ts";

export class UnitOfWorkForAdmin implements IUnitOfWorkForAdmin {
  #db;
  #tenantId;

  constructor(db: InMemoryDb, tenantId: Domain.User.Type["id"]) {
    this.#db = db;
    this.#tenantId = tenantId;
  }

  async run<T>(work: (repos: IUnitOfWorkReposForAdmin) => Promise<T>): Promise<T> {
    return await work({
      refreshToken: new RefreshTokenRepoForAdmin(this.#db, this.#tenantId),
      todo: new TodoRepoForAdmin(this.#db, this.#tenantId),
      user: new UserRepoForAdmin(this.#db, this.#tenantId),
    });
  }
}
