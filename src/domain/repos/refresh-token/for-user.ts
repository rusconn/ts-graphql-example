// TODO: Transaction<DB>を抽象化

import type { Transaction } from "kysely";

import type { DB } from "../../../infra/datasources/_shared/types.ts";
import type * as Domain from "../../../domain/models.ts";

export interface IRefreshTokenRepoForUser {
  add(refreshToken: Domain.RefreshToken.Type, trx: Transaction<DB>): Promise<void>;

  touch(token: Domain.RefreshToken.Type["token"], now: Date, trx: Transaction<DB>): Promise<void>;

  retainLatest(
    userId: Domain.RefreshToken.Type["userId"],
    limit: number,
    trx?: Transaction<DB>,
  ): Promise<void>;

  remove(token: Domain.RefreshToken.Type["token"], trx: Transaction<DB>): Promise<void>;

  removeByUserId(userId: Domain.RefreshToken.Type["userId"], trx: Transaction<DB>): Promise<void>;
}
