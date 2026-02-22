import type { Kysely, Transaction } from "kysely";

import type {
  IUnitOfWorkForGuest,
  IUnitOfWorkReposForGuest,
} from "../../../domain/unit-of-works/for-guest.ts";
import type { DB } from "../../datasources/_shared/generated.ts";
import { RefreshTokenRepoForGuest } from "./for-guest/refresh-token.ts";
import { UserRepoForGuest } from "./for-guest/user.ts";

export class UnitOfWorkForGuest implements IUnitOfWorkForGuest {
  #db;

  constructor(db: Kysely<DB>) {
    this.#db = db;
  }

  async run<T>(work: (repos: IUnitOfWorkReposForGuest) => Promise<T>): Promise<T> {
    if (this.#db.isTransaction) {
      return await work({
        refreshToken: new RefreshTokenRepoForGuest(this.#db as Transaction<DB>),
        user: new UserRepoForGuest(this.#db as Transaction<DB>),
      });
    }

    return await this.#db.transaction().execute(async (trx) => {
      return await work({
        refreshToken: new RefreshTokenRepoForGuest(trx),
        user: new UserRepoForGuest(trx),
      });
    });
  }
}
