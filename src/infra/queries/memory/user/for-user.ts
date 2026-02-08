import type { Kysely } from "kysely";

import type { DB, RefreshToken, User } from "../../../datasources/_shared/types.ts";
import type * as UserLoader from "./loaders/user.ts";
import { UserQueryShared } from "./shared.ts";
import type { IUserQueryForUser } from "../../../../graphql/_queries/user/for-user.ts";

export class UserQueryForUser implements IUserQueryForUser {
  #shared;

  constructor(db: Kysely<DB>, tenantId: User["id"]) {
    this.#shared = new UserQueryShared(db, tenantId);
  }

  async find(id: User["id"]) {
    return await this.#shared.findById(id);
  }

  async findByRefreshToken(token: RefreshToken["token"]) {
    return await this.#shared.findByRefreshToken(token);
  }

  async load(key: UserLoader.Key) {
    return await this.#shared.load(key);
  }
}
