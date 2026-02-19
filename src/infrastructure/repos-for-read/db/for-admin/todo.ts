import type { Kysely } from "kysely";

import type * as Domain from "../../../../domain/entities.ts";
import type { ITodoReaderRepoForAdmin } from "../../../../domain/repos-for-read/for-admin/todo.ts";
import type { DB } from "../../../datasources/_shared/types.ts";
import { TodoReaderRepoShared } from "../_shared/todo.ts";

export class TodoReaderRepoForAdmin implements ITodoReaderRepoForAdmin {
  #shared;

  constructor(db: Kysely<DB>, tenantId: Domain.User.Type["id"]) {
    this.#shared = new TodoReaderRepoShared(db, tenantId);
  }

  async find(id: Domain.Todo.Type["id"]) {
    return await this.#shared.find(id);
  }
}
