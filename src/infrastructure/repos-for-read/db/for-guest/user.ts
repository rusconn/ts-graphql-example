import type { Kysely } from "kysely";

import type * as Domain from "../../../../domain/entities.ts";
import type { IUserReaderRepoForGuest } from "../../../../domain/repos-for-read/for-guest/user.ts";
import type { DB } from "../../../datasources/_shared/types.ts";
import { UserReaderRepoShared } from "../_shared/user.ts";

export class UserReaderRepoForGuest implements IUserReaderRepoForGuest {
  #shared;

  constructor(db: Kysely<DB>) {
    this.#shared = new UserReaderRepoShared(db);
  }

  async find(id: Domain.User.Type["id"]) {
    return await this.#shared.find(id);
  }

  async findByEmail(email: Domain.User.Type["email"]) {
    return await this.#shared.findByEmail(email);
  }
}
