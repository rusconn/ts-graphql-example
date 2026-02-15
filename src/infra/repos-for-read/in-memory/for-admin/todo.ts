import type * as Domain from "../../../../domain/entities.ts";
import type { ITodoReaderRepoForAdmin } from "../../../../domain/repos-for-read/for-admin/todo.ts";
import type { InMemoryDb } from "../../../datasources/in-memory/store.ts";
import { TodoRepoShared } from "../_shared/todo.ts";

export class TodoReaderRepoForAdmin implements ITodoReaderRepoForAdmin {
  #shared;

  constructor(db: InMemoryDb, tenantId: Domain.User.Type["id"]) {
    this.#shared = new TodoRepoShared(db, tenantId);
  }

  async find(id: Domain.Todo.Type["id"]) {
    return await this.#shared.find(id);
  }
}
