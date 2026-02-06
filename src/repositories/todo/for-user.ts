import type { Kysely, Transaction } from "kysely";

import type { DB, User } from "../../db/types.ts";
import type * as Domain from "../../domain/todo.ts";
import { TodoRepoShared } from "./shared.ts";

export class TodoRepoForUser {
  #shared;

  constructor(db: Kysely<DB>, tenantId: User["id"]) {
    this.#shared = new TodoRepoShared(db, tenantId);
  }

  async find(id: Domain.Todo["id"], trx?: Transaction<DB>) {
    return await this.#shared.find(id, trx);
  }

  async create(todo: Domain.Todo, trx?: Transaction<DB>) {
    return await this.#shared.create(todo, trx);
  }

  async update(todo: Domain.Todo, trx?: Transaction<DB>) {
    return await this.#shared.update(todo, trx);
  }

  async delete(id: Domain.Todo["id"], trx?: Transaction<DB>) {
    return await this.#shared.delete(id, trx);
  }
}
