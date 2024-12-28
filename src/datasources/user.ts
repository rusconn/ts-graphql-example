import type { Kysely, Transaction } from "kysely";

import type { DB } from "../db/generated/types.ts";
import type { NewUser, UpdUser, User } from "../db/models/user.ts";
import * as userId from "../db/models/user/id.ts";
import * as userLoader from "./user/loader.ts";
import { UserTodoAPI } from "./user/todo.ts";

export class UserAPI {
  #db;
  #loaders;

  loadTodo;
  loadTodoPage;
  loadTodoCount;
  countTodo;
  createTodo;
  updateTodo;
  deleteTodo;

  constructor(db: Kysely<DB>) {
    this.#db = db;
    this.#loaders = {
      user: userLoader.init(db),
    };

    const todoAPI = new UserTodoAPI(db);
    this.loadTodo = todoAPI.load;
    this.loadTodoPage = todoAPI.loadPage;
    this.loadTodoCount = todoAPI.loadCount;
    this.countTodo = todoAPI.count;
    this.createTodo = todoAPI.create;
    this.updateTodo = todoAPI.update;
    this.deleteTodo = todoAPI.delete;
  }

  load = async (id: User["id"]) => {
    return await this.#loaders.user.load(id);
  };

  getById = async (id: User["id"], trx?: Transaction<DB>) => {
    return await this.#getByKey("id")(id, trx);
  };

  getByEmail = async (email: User["email"], trx?: Transaction<DB>) => {
    return await this.#getByKey("email")(email, trx);
  };

  getByToken = async (token: User["token"], trx?: Transaction<DB>) => {
    return await this.#getByKey("token")(token, trx);
  };

  #getByKey =
    (key: "id" | "email" | "token") =>
    async (val: User["id"] | User["email"] | User["token"], trx?: Transaction<DB>) => {
      const user = await (trx ?? this.#db)
        .selectFrom("User")
        .where(key, "=", val)
        .selectAll()
        .$if(trx != null, (qb) => qb.forUpdate())
        .executeTakeFirst();

      return user as User | undefined;
    };

  getPage = async ({
    cursor,
    sortKey,
    limit,
    reverse,
  }: {
    cursor?: User["id"];
    sortKey: "createdAt" | "updatedAt";
    limit: number;
    reverse: boolean;
  }) => {
    const orderColumn = sortKey === "createdAt" ? "id" : sortKey;

    const [direction, comp] = reverse //
      ? (["desc", "<"] as const)
      : (["asc", ">"] as const);

    const cursorOrderColumn =
      cursor &&
      this.#db //
        .selectFrom("User")
        .where("id", "=", cursor)
        .select(orderColumn);

    const page = await this.#db
      .selectFrom("User")
      .$if(cursorOrderColumn != null, (qb) =>
        qb.where(({ eb }) =>
          eb.or([
            eb(orderColumn, comp, cursorOrderColumn!),
            eb.and([
              //
              eb(orderColumn, "=", cursorOrderColumn!),
              eb("id", comp, cursor!),
            ]),
          ]),
        ),
      )
      .selectAll()
      .orderBy(orderColumn, direction)
      .orderBy("id", direction)
      .limit(limit)
      .execute();

    return page as User[];
  };

  count = async () => {
    const result = await this.#db
      .selectFrom("User")
      .select(({ fn }) => fn.countAll().as("count"))
      .executeTakeFirstOrThrow();

    return Number(result.count);
  };

  create = async (data: Omit<NewUser, "id" | "updatedAt">, trx?: Transaction<DB>) => {
    const { id, date } = userId.genWithDate();

    const user = await (trx ?? this.#db)
      .insertInto("User")
      .values({
        id,
        updatedAt: date,
        ...data,
      })
      .returningAll()
      .executeTakeFirst();

    return user as User | undefined;
  };

  updateById = async (
    id: User["id"],
    data: Omit<UpdUser, "id" | "updatedAt">,
    trx?: Transaction<DB>,
  ) => {
    return await this.#updateByKey("id")(id, data, trx);
  };

  updateByEmail = async (
    email: User["email"],
    data: Omit<UpdUser, "id" | "updatedAt">,
    trx?: Transaction<DB>,
  ) => {
    return await this.#updateByKey("email")(email, data, trx);
  };

  #updateByKey =
    (key: "id" | "email") =>
    async (
      val: User["id"] | User["email"],
      data: Omit<UpdUser, "id" | "updatedAt">,
      trx?: Transaction<DB>,
    ) => {
      const user = await (trx ?? this.#db)
        .updateTable("User")
        .where(key, "=", val)
        .set({
          updatedAt: new Date(),
          ...data,
        })
        .returningAll()
        .executeTakeFirst();

      return user as User | undefined;
    };

  delete = async (id: User["id"], trx?: Transaction<DB>) => {
    const user = await (trx ?? this.#db)
      .deleteFrom("User")
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirst();

    return user as User | undefined;
  };
}
