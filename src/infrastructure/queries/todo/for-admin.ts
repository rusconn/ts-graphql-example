import type { ReadonlyKysely } from "kysely/readonly";

import type { ITodoQueryForAdmin } from "../../../application/queries/todo/for-admin.ts";
import type {
  CountByUserParams,
  FindByUserParams,
  PageByUserParams,
} from "../../../application/queries/todo/params.ts";
import type * as Domain from "../../../domain/entities.ts";
import type { DB } from "../../datasources/db/types.ts";
import { TodoQueryShared } from "./shared.ts";

export class TodoQueryForAdmin implements ITodoQueryForAdmin {
  #shared;

  constructor(db: ReadonlyKysely<DB>) {
    this.#shared = new TodoQueryShared(db);
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
