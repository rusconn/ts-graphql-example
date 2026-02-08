import type { Kysely, Transaction } from "kysely";

import type { DB, User } from "../../../datasources/_shared/types.ts";
import type * as Domain from "../../../../domain/models.ts";
import type { ITodoRepoForUser } from "../../../../domain/repos/todo/for-user.ts";
import { TodoRepoShared } from "./shared.ts";

export class TodoRepoForUser implements ITodoRepoForUser {
  #shared;

  constructor(db: Kysely<DB>, tenantId: User["id"]) {
    this.#shared = new TodoRepoShared(db, tenantId);
  }

  async find(id: Domain.Todo.Type["id"], trx?: Transaction<DB>) {
    return await this.#shared.find(id, trx);
  }

  async add(todo: Domain.Todo.Type, trx?: Transaction<DB>) {
    return await this.#shared.add(todo, trx);
  }

  async update(todo: Domain.Todo.Type, trx?: Transaction<DB>) {
    return await this.#shared.update(todo, trx);
  }

  async remove(id: Domain.Todo.Type["id"], trx?: Transaction<DB>) {
    return await this.#shared.remove(id, trx);
  }

  async removeByUserId(userId: Domain.Todo.Type["userId"], trx?: Transaction<DB>) {
    return await this.#shared.removeByUserId(userId, trx);
  }
}
