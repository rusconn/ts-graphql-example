import type * as Domain from "../../../domain/entities.ts";
import type {
  IUnitOfWorkForUser,
  IUnitOfWorkReposForUser,
} from "../../../domain/unit-of-works/for-user.ts";
import type { InMemoryDb } from "../../datasources/in-memory/store.ts";
import { RefreshTokenRepoForUser } from "./for-user/refresh-token.ts";
import { TodoRepoForUser } from "./for-user/todo.ts";
import { UserRepoForUser } from "./for-user/user.ts";

export class UnitOfWorkForUser implements IUnitOfWorkForUser {
  #db;
  #tenantId;

  constructor(db: InMemoryDb, tenantId: Domain.User.Type["id"]) {
    this.#db = db;
    this.#tenantId = tenantId;
  }

  async run<T>(work: (repos: IUnitOfWorkReposForUser) => Promise<T>): Promise<T> {
    return await work({
      refreshToken: new RefreshTokenRepoForUser(this.#db, this.#tenantId),
      todo: new TodoRepoForUser(this.#db, this.#tenantId),
      user: new UserRepoForUser(this.#db, this.#tenantId),
    });
  }
}
