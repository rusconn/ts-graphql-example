import type { Kysely } from "kysely";

import type { DB } from "../../../datasources/_shared/types.ts";
import type * as UserLoader from "./loaders/user.ts";
import { UserQueryShared } from "./shared.ts";
import type { IUserQueryForUser } from "../../../../graphql/_queries/user/for-user.ts";
import type * as Domain from "../../../../domain/models.ts";

export class UserQueryForUser implements IUserQueryForUser {
  #shared;

  constructor(db: Kysely<DB>, tenantId: Domain.User.Type["id"]) {
    this.#shared = new UserQueryShared(db, tenantId);
  }

  async find(id: Domain.User.Type["id"]) {
    return await this.#shared.find(id);
  }

  async findByRefreshToken(token: Domain.RefreshToken.Type["token"]) {
    return await this.#shared.findByRefreshToken(token);
  }

  async load(key: UserLoader.Key) {
    return await this.#shared.load(key);
  }
}
