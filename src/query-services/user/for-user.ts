import type { Kysely } from "kysely";

import type { DB, User, UserToken } from "../../db/types.ts";
import type * as UserLoader from "./loaders/user.ts";
import { UserQueryShared } from "./shared.ts";

export class UserQueryForUser {
  #shared;

  constructor(db: Kysely<DB>) {
    this.#shared = new UserQueryShared(db);
  }

  async findById(id: User["id"]) {
    return await this.#shared.findById(id);
  }

  async findByRefreshToken(refreshToken: UserToken["refreshToken"]) {
    return await this.#shared.findByRefreshToken(refreshToken);
  }

  async load(key: UserLoader.Key) {
    return await this.#shared.load(key);
  }
}
