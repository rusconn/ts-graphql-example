import type { Kysely } from "kysely";

import type * as Domain from "../../../../domain/models.ts";
import * as Dto from "../../../../graphql/_dto.ts";
import type { IUserQueryForGuest } from "../../../../graphql/_queries/user/for-guest.ts";
import type { DB } from "../../../datasources/_shared/types.ts";
import { UserQueryShared } from "./shared.ts";

export class UserQueryForGuest implements IUserQueryForGuest {
  #shared;

  constructor(db: Kysely<DB>) {
    this.#shared = new UserQueryShared(db);
  }

  static async find(id: Domain.User.Type["id"], db: Kysely<DB>) {
    const user = await db
      .selectFrom("users") //
      .where("id", "=", id)
      .selectAll()
      .executeTakeFirst();

    return user && Dto.User.parseOrThrow(user);
  }

  async findByRefreshToken(token: Domain.RefreshToken.Type["token"]) {
    return await this.#shared.findByRefreshToken(token);
  }
}
