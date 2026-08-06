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
  #db;
  #shared;
  #tenantId;

  constructor(db: ReadonlyKysely<DB>, tenantId: Domain.Todo.Type["userId"]) {
    this.#db = db;
    this.#shared = new TodoQueryShared(db);
    this.#tenantId = tenantId;
  }

  async find(id: Domain.Todo.Type["id"]) {
    return await this.#shared.find(id);
  }

  async count() {
    const result = await this.#db
      .selectFrom("todos")
      .where("userId", "=", this.#tenantId)
      .select(({ fn }) => fn.countAll<number>().as("count"))
      .executeTakeFirst();

    return result?.count ?? 0;
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
