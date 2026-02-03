import type { Kysely, Transaction } from "kysely";

import type { DB } from "../../db/types.ts";
import type * as Domain from "../../domain/todo.ts";
import { TodoRepoShared } from "./shared.ts";

type TodoKey = {
  id: Domain.Todo["id"];
  userId?: Domain.Todo["userId"];
};

export class TodoRepoForAdmin {
  #shared;

  constructor(db: Kysely<DB>) {
    this.#shared = new TodoRepoShared(db);
  }

  async find(id: Domain.Todo["id"], trx?: Transaction<DB>) {
    return await this.#shared.find(id, trx);
  }

  async save(todo: Domain.Todo, trx?: Transaction<DB>) {
    return await this.#shared.save(todo, trx);
  }

  async delete(key: TodoKey, trx?: Transaction<DB>) {
    return await this.#shared.delete(key, trx);
  }
}
