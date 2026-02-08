// TODO: Transaction<DB>を抽象化

import type { Transaction } from "kysely";

import type { DB } from "../../../infra/datasources/_shared/types.ts";
import type * as Domain from "../../../domain/models.ts";

export interface ITodoRepoForUser {
  find(id: Domain.Todo.Type["id"], trx?: Transaction<DB>): Promise<Domain.Todo.Type | undefined>;

  add(todo: Domain.Todo.Type, trx: Transaction<DB>): Promise<void>;

  update(todo: Domain.Todo.Type, trx: Transaction<DB>): Promise<void>;

  remove(id: Domain.Todo.Type["id"], trx: Transaction<DB>): Promise<void>;

  removeByUserId(userId: Domain.Todo.Type["userId"], trx: Transaction<DB>): Promise<void>;
}
