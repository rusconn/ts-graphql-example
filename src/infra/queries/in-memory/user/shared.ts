import * as Dto from "../../../../application/queries/dto.ts";
import type * as Domain from "../../../../domain/entities.ts";
import type { InMemoryDb } from "../../../datasources/in-memory/store.ts";
import * as UserLoader from "./loaders/user.ts";

export class UserQueryShared {
  #db;
  #loaders;
  #tenantId;

  constructor(db: InMemoryDb, tenantId?: Domain.User.Type["id"]) {
    this.#db = db;
    this.#loaders = {
      user: UserLoader.create(db, tenantId),
    };
    this.#tenantId = tenantId;
  }

  async find(id: Domain.User.Type["id"]) {
    const user = this.#db.users.get(id);
    if (!user) {
      return undefined;
    }

    if (this.#tenantId != null && user.id !== this.#tenantId) {
      return undefined;
    }

    return Dto.User.parseOrThrow(user);
  }

  async findByRefreshToken(token: Domain.RefreshToken.Type["token"]) {
    const refreshToken = this.#db.refreshTokens.get(token);
    if (!refreshToken) {
      return undefined;
    }

    const user = this.#db.users.get(refreshToken.userId);
    if (!user) {
      return undefined;
    }

    if (this.#tenantId != null && user.id !== this.#tenantId) {
      return undefined;
    }

    return Dto.User.parseOrThrow(user);
  }

  async load(key: UserLoader.Key) {
    const user = await this.#loaders.user.load(key);
    return user && Dto.User.parseOrThrow(user);
  }
}
