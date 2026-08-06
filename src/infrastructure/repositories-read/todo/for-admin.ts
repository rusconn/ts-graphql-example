import type { ReadonlyKysely } from "kysely/readonly";

import type * as Domain from "../../../domain/entities.ts";
import type { ITodoReaderRepoForAdmin } from "../../../domain/repositories-read/todo/for-admin.ts";
import type { DB } from "../../datasources/db/types.ts";
import { TodoReaderRepoShared } from "./shared.ts";

export class TodoReaderRepoForAdmin implements ITodoReaderRepoForAdmin {
  #shared;

  constructor(db: ReadonlyKysely<DB>, tenantId: Domain.User.Type["id"]) {
    this.#shared = new TodoReaderRepoShared(db, tenantId);
  }

  async find(id: Domain.Todo.Type["id"]) {
    return await this.#shared.find(id);
  }

  async count() {
    return await this.#shared.count();
  }
}
