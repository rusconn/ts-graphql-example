import type * as Domain from "../../../../domain/entities.ts";
import type { IUserRepoForUser } from "../../../../domain/unit-of-works/for-user/user.ts";
import type { InMemoryDb } from "../../../datasources/in-memory/store.ts";
import { UserRepoShared } from "../_shared/user.ts";

export class UserRepoForUser implements IUserRepoForUser {
  #shared;

  constructor(trx: InMemoryDb, tenantId: Domain.User.Type["id"]) {
    this.#shared = new UserRepoShared(trx, tenantId);
  }

  async add(user: Domain.User.Type) {
    return await this.#shared.add(user);
  }

  async update(user: Domain.User.Type) {
    return await this.#shared.update(user);
  }

  async remove(id: Domain.User.Type["id"]) {
    return await this.#shared.remove(id);
  }
}
