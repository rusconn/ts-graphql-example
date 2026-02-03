import type { Kysely } from "kysely";

import type { DB, User, UserToken } from "../../db/types.ts";
import { UserQueryShared } from "./shared.ts";

export class UserQueryForGuest {
  #shared;

  constructor(db: Kysely<DB>) {
    this.#shared = new UserQueryShared(db);
  }

  static async findById(id: User["id"], db: Kysely<DB>) {
    const user = await db
      .selectFrom("users") //
      .where("id", "=", id)
      .selectAll()
      .executeTakeFirst();

    return user;
  }

  async findByRefreshToken(refreshToken: UserToken["refreshToken"]) {
    return await this.#shared.findByRefreshToken(refreshToken);
  }
}
