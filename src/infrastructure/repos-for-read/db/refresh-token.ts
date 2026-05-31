import type { ReadonlyKysely } from "kysely/readonly";

import * as Domain from "../../../domain/entities.ts";
import type { IRefreshTokenReaderRepo } from "../../../domain/repos-for-read/refresh-token.ts";
import type { DB } from "../../datasources/_shared/types.ts";

export class RefreshTokenReaderRepo implements IRefreshTokenReaderRepo {
  #db;

  constructor(db: ReadonlyKysely<DB>) {
    this.#db = db;
  }

  async find(token: Domain.RefreshToken.Type["token"]) {
    const refreshToken = await this.#db
      .selectFrom("refreshTokens")
      .where("token", "=", token)
      .selectAll()
      .executeTakeFirst();

    return refreshToken && Domain.RefreshToken.parseOrThrow(refreshToken);
  }
}
