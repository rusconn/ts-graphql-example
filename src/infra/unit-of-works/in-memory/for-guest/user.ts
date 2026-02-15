import type * as Domain from "../../../../domain/entities.ts";
import type { IUserRepoForGuest } from "../../../../domain/unit-of-works/for-guest/user.ts";
import type { InMemoryDb } from "../../../datasources/in-memory/store.ts";
import { UserRepoShared } from "../_shared/user.ts";

export class UserRepoForGuest implements IUserRepoForGuest {
  #shared;

  constructor(trx: InMemoryDb) {
    this.#shared = new UserRepoShared(trx);
  }

  async add(user: Domain.User.Type) {
    return await this.#shared.add(user);
  }

  async update(user: Domain.User.Type) {
    return await this.#shared.update(user);
  }
}
