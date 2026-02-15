import type { IUserQueryForUser } from "../../../../application/queries/user/for-user.ts";
import type * as Domain from "../../../../domain/entities.ts";
import type { InMemoryDb } from "../../../datasources/in-memory/store.ts";
import type * as UserLoader from "./loaders/user.ts";
import { UserQueryShared } from "./shared.ts";

export class UserQueryForUser implements IUserQueryForUser {
  #shared;

  constructor(db: InMemoryDb, tenantId: Domain.User.Type["id"]) {
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
