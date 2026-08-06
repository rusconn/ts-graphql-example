import type { ReadonlyKysely } from "kysely/readonly";

import type { ITodoQueryForUser } from "../../../application/queries/todo/for-user.ts";
import type {
  CountByUserParams,
  FindByUserParams,
  PageByUserParams,
} from "../../../application/queries/todo/params.ts";
import type * as Domain from "../../../domain/entities.ts";
import type { DB } from "../../datasources/db/types.ts";
import { TodoQueryShared } from "./shared.ts";

export class TodoQueryForUser implements ITodoQueryForUser {
  #shared;

  constructor(db: ReadonlyKysely<DB>, tenantId: Domain.Todo.Type["userId"]) {
    this.#shared = new TodoQueryShared(db, tenantId);
  }

  async find(id: Domain.Todo.Type["id"]) {
    return await this.#shared.find(id);
  }

  async findByUser(params: FindByUserParams) {
    return await this.#shared.findByUser(params);
  }

  async pageByUser(params: PageByUserParams) {
    return await this.#shared.pageByUser(params);
  }

  async countByUser(params: CountByUserParams) {
    return await this.#shared.countByUser(params);
  }
}
