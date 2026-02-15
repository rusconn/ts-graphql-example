import type * as Domain from "../../../../domain/entities.ts";
import type { ITodoReaderRepoForUser } from "../../../../domain/repos-for-read/for-user/todo.ts";
import type { InMemoryDb } from "../../../datasources/in-memory/store.ts";
import { TodoRepoShared } from "../_shared/todo.ts";

export class TodoReaderRepoForUser implements ITodoReaderRepoForUser {
  #shared;

  constructor(db: InMemoryDb, tenantId: Domain.User.Type["id"]) {
    this.#shared = new TodoRepoShared(db, tenantId);
  }

  async find(id: Domain.Todo.Type["id"]) {
    return await this.#shared.find(id);
  }
}
