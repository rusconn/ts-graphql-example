import type { ReadonlyKysely } from "kysely/readonly";

import type * as Domain from "../../../domain/entities.ts";
import type { IUserReaderRepoForGuest } from "../../../domain/repositories-read/user/for-guest.ts";
import type { DB } from "../../datasources/db/types.ts";
import { UserReaderRepoShared } from "./shared.ts";

export class UserReaderRepoForGuest implements IUserReaderRepoForGuest {
  #shared;

  constructor(db: ReadonlyKysely<DB>) {
    this.#shared = new UserReaderRepoShared(db);
  }

  async find(id: Domain.User.Type["id"]) {
    return await this.#shared.find(id);
  }

  async findByEmail(email: Domain.User.Type["email"]) {
    return await this.#shared.findByEmail(email);
  }
}
