// TODO: Transaction<DB>を抽象化

import type { Transaction } from "kysely";

import type { DB } from "../../../infra/datasources/_shared/types.ts";
import type * as Domain from "../../../domain/models.ts";

export interface IUserRepoForGuest {
  add(user: Domain.User.Type, trx: Transaction<DB>): Promise<void>;

  update(user: Domain.User.Type, trx: Transaction<DB>): Promise<void>;
}
