import type { Kysely } from "kysely";

import type * as Domain from "../../../../domain/entities.ts";
import type { ITodoReaderRepoForUser } from "../../../../domain/repos-for-read/for-user/todo.ts";
import type { DB } from "../../../datasources/_shared/types.ts";
import { TodoReaderRepoShared } from "../_shared/todo.ts";

export class TodoReaderRepoForUser implements ITodoReaderRepoForUser {
  #shared;

  constructor(db: Kysely<DB>, tenantId: Domain.User.Type["id"]) {
    this.#shared = new TodoReaderRepoShared(db, tenantId);
  }

  async find(id: Domain.Todo.Type["id"]) {
    return await this.#shared.find(id);
  }
}
