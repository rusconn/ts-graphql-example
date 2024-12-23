import type { Kysely } from "kysely";
import type { OverrideProperties } from "type-fest";

import type { TodoInsert, TodoSelect, TodoUpdate } from "../db/models.ts";
import type { DB } from "../db/types.ts";
import { loaders } from "./todo/loaders.ts";
import type { TodoId } from "./todo/types/id.ts";
import * as todoId from "./todo/types/id.ts";
import type { UserId } from "./user/types/id.ts";

export type Todo = OverrideProperties<
  TodoSelect,
  {
    id: TodoId;
    userId: UserId;
  }
>;

type NewTodo = OverrideProperties<
  TodoInsert,
  {
    userId: UserId;
  }
>;

type UpdTodo = OverrideProperties<
  TodoUpdate,
  {
    userId?: UserId;
  }
>;

export class TodoAPI {
  #db;
  #loaders;

  constructor(db: Kysely<DB>) {
    this.#db = db;
    this.#loaders = {
      todo: loaders.todo.init(db),
      userTodos: loaders.userTodos.initClosure(db),
      userTodosCount: loaders.userTodosCount.initClosure(db),
    };
  }

  getById = async (id: Todo["id"]) => {
    const got = await this.#loaders.todo.load({ id });

    return got as Todo | undefined;
  };

  getByIds = async (ids: Pick<Todo, "id" | "userId">) => {
    const got = await this.#loaders.todo.load(ids);

    return got as Todo | undefined;
  };

  getPageByUserId = async (
    userId: Todo["userId"],
    params: {
      status?: Todo["status"];
      cursor?: Pick<Todo, "id">;
      limit: number;
      sortKey: "createdAt" | "updatedAt";
      reverse: boolean;
    },
  ) => {
    const got = await this.#loaders.userTodos(params).load({ id: userId });

    return got as Todo[];
  };

  countByUserId = async (
    userId: Todo["userId"],
    filter: {
      status?: Todo["status"];
    } = {},
  ) => {
    return this.#loaders.userTodosCount(filter).load({ id: userId });
  };

  create = async (data: Omit<NewTodo, "id" | "updatedAt">) => {
    const { id, date } = todoId.genWithDate();

    const got = await this.#db
      .insertInto("Todo")
      .values({ id, updatedAt: date, ...data })
      .returningAll()
      .executeTakeFirst();

    return got as Todo | undefined;
  };

  updateByIds = async (
    ids: Pick<Todo, "id" | "userId">, //
    data: Omit<UpdTodo, "id" | "updatedAt">,
  ) => {
    const got = await this.#db
      .updateTable("Todo")
      .where("id", "=", ids.id)
      .where("userId", "=", ids.userId)
      .set({ updatedAt: new Date(), ...data })
      .returningAll()
      .executeTakeFirst();

    return got as Todo | undefined;
  };

  deleteByIds = async (ids: Pick<Todo, "id" | "userId">) => {
    const got = await this.#db
      .deleteFrom("Todo")
      .where("id", "=", ids.id)
      .where("userId", "=", ids.userId)
      .returningAll()
      .executeTakeFirst();

    return got as Todo | undefined;
  };
}
