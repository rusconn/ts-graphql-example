// TODO: Transaction<DB>を抽象化

import type { Transaction } from "kysely";

import type { DB } from "../../../infra/datasources/_shared/types.ts";
import type * as Domain from "../../../domain/models.ts";

export interface IUserRepoForUser {
  find(id: Domain.User.Type["id"], trx?: Transaction<DB>): Promise<Domain.User.Type | undefined>;

  add(user: Domain.User.Type, trx: Transaction<DB>): Promise<void>;

  update(user: Domain.User.Type, trx: Transaction<DB>): Promise<void>;

  remove(id: Domain.User.Type["id"], trx: Transaction<DB>): Promise<void>;
}
