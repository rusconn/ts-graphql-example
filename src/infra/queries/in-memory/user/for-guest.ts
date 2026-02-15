import * as Dto from "../../../../application/queries/dto.ts";
import type { IUserQueryForGuest } from "../../../../application/queries/user/for-guest.ts";
import type * as Domain from "../../../../domain/entities.ts";
import type { InMemoryDb } from "../../../datasources/in-memory/store.ts";
import { UserQueryShared } from "./shared.ts";

export class UserQueryForGuest implements IUserQueryForGuest {
  #shared;

  constructor(db: InMemoryDb) {
    this.#shared = new UserQueryShared(db);
  }

  static async find(id: Domain.User.Type["id"], db: InMemoryDb) {
    const user = db.users.get(id);
    return user && Dto.User.parseOrThrow(user);
  }

  async findByRefreshToken(token: Domain.RefreshToken.Type["token"]) {
    return await this.#shared.findByRefreshToken(token);
  }
}
