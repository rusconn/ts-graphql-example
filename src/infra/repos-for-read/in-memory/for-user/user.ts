import type * as Domain from "../../../../domain/entities.ts";
import type { IUserReaderRepoForUser } from "../../../../domain/repos-for-read/for-user/user.ts";
import type { InMemoryDb } from "../../../datasources/in-memory/store.ts";
import { UserRepoShared } from "../_shared/user.ts";

export class UserReaderRepoForUser implements IUserReaderRepoForUser {
  #shared;

  constructor(db: InMemoryDb, tenantId: Domain.User.Type["id"]) {
    this.#shared = new UserRepoShared(db, tenantId);
  }

  async find(id: Domain.User.Type["id"]) {
    return await this.#shared.find(id);
  }
}
