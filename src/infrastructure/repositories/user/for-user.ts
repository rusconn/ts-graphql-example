import type { Transaction } from "kysely";

import type * as Domain from "../../../domain/entities.ts";
import type { IUserRepoForUser } from "../../../domain/repositories/user/for-user.ts";
import type { DB } from "../../datasources/db/types.ts";
import { UserRepoShared } from "./shared.ts";

export class UserRepoForUser implements IUserRepoForUser {
  #shared;

  constructor(trx: Transaction<DB>, tenantId: Domain.User.Type["id"]) {
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
