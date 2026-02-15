import type {
  IUnitOfWorkForGuest,
  IUnitOfWorkReposForGuest,
} from "../../../domain/unit-of-works/for-guest.ts";
import type { InMemoryDb } from "../../datasources/in-memory/store.ts";
import { RefreshTokenRepoForGuest } from "./for-guest/refresh-token.ts";
import { UserRepoForGuest } from "./for-guest/user.ts";

export class UnitOfWorkForGuest implements IUnitOfWorkForGuest {
  #db;

  constructor(db: InMemoryDb) {
    this.#db = db;
  }

  async run<T>(work: (repos: IUnitOfWorkReposForGuest) => Promise<T>): Promise<T> {
    return await work({
      refreshToken: new RefreshTokenRepoForGuest(this.#db),
      user: new UserRepoForGuest(this.#db),
    });
  }
}
