import type { Transaction } from "kysely";

import type * as Domain from "../../../domain/entities.ts";
import type { ITodoRepoForUser } from "../../../domain/repositories/todo/for-user.ts";
import type { DB } from "../../datasources/db/types.ts";
import { TodoRepoShared } from "./shared.ts";

export class TodoRepoForUser implements ITodoRepoForUser {
  #shared;

  constructor(trx: Transaction<DB>, tenantId: Domain.User.Type["id"]) {
    this.#shared = new TodoRepoShared(trx, tenantId);
  }

  async add(todo: Domain.Todo.Type) {
    return await this.#shared.add(todo);
  }

  async update(todo: Domain.Todo.Type) {
    return await this.#shared.update(todo);
  }

  async remove(id: Domain.Todo.Type["id"]) {
    return await this.#shared.remove(id);
  }

  async removeByUserId(userId: Domain.Todo.Type["userId"]) {
    return await this.#shared.removeByUserId(userId);
  }
}
