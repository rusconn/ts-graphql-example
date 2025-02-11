import type { Kysely } from "kysely";

import type { DB } from "../db/types.ts";
import type { User, UserKey, UserKeyCols, UserNew, UserUpd } from "../models/user.ts";
import * as UserId from "../models/user/id.ts";
import * as userLoader from "./loaders/user.ts";

export class UserAPI {
  #db;
  #loaders;

  constructor(db: Kysely<DB>) {
    this.#db = db;
    this.#loaders = {
      user: userLoader.init(db),
    };
  }

  getById = async (id: User["id"]) => {
    return await this.#getByKey("id")(id);
  };

  getByEmail = async (email: User["email"]) => {
    return await this.#getByKey("email")(email);
  };

  getByToken = async (token: Exclude<User["token"], null>) => {
    return await this.#getByKey("token")(token);
  };

  #getByKey = (key: UserKeyCols) => async (val: UserKey) => {
    const user = await this.#db
      .selectFrom("User")
      .where(key, "=", val)
      .selectAll()
      .executeTakeFirst();

    return user as User | undefined;
  };

  getPage = async (params: {
    sortKey: "createdAt" | "updatedAt";
    reverse: boolean;
    cursor?: User["id"];
    limit: number;
  }) => {
    const { sortKey, reverse, cursor, limit } = params;

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
      .$if(cursor != null, (qb) =>
        qb.where(({ eb, refTuple, tuple }) =>
          eb(
            refTuple(orderColumn, "id"), //
            comp,
            tuple(cursorOrderColumn!, cursor!),
          ),
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
      .select(({ fn }) => fn.countAll<number>().as("count"))
      .executeTakeFirstOrThrow();

    return result.count;
  };

  create = async (data: UserNew) => {
    const { id, date } = UserId.genWithDate();

    const user = await this.#db
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

  updateById = async (id: User["id"], data: UserUpd) => {
    return await this.#updateByKey("id")(id, data);
  };

  updateByEmail = async (email: User["email"], data: UserUpd) => {
    return await this.#updateByKey("email")(email, data);
  };

  #updateByKey = (key: UserKeyCols) => async (val: UserKey, data: UserUpd) => {
    const user = await this.#db
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

  delete = async (id: User["id"]) => {
    const user = await this.#db
      .deleteFrom("User")
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirst();

    return user as User | undefined;
  };

  load = async (key: userLoader.Key) => {
    return await this.#loaders.user.load(key);
  };
}
