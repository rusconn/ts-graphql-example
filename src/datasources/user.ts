import type { Kysely, Transaction } from "kysely";

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

  getById = async (id: User["id"], trx?: Transaction<DB>) => {
    return await this.#getByKey("id")(id, trx);
  };

  getByEmail = async (email: User["email"], trx?: Transaction<DB>) => {
    return await this.#getByKey("email")(email, trx);
  };

  getByToken = async (token: Exclude<User["token"], null>, trx?: Transaction<DB>) => {
    return await this.#getByKey("token")(token, trx);
  };

  #getByKey = (key: UserKeyCols) => async (val: UserKey, trx?: Transaction<DB>) => {
    const user = await (trx ?? this.#db)
      .selectFrom("User")
      .where(key, "=", val)
      .selectAll()
      .$if(trx != null, (qb) => qb.forUpdate())
      .executeTakeFirst();

    return user as User | undefined;
  };

  getPage = async ({
    sortKey,
    reverse,
    cursor,
    limit,
  }: {
    sortKey: "createdAt" | "updatedAt";
    reverse: boolean;
    cursor?: User["id"];
    limit: number;
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

  create = async (data: UserNew, trx?: Transaction<DB>) => {
    const { id, date } = UserId.genWithDate();

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

  updateById = async (id: User["id"], data: UserUpd, trx?: Transaction<DB>) => {
    return await this.#updateByKey("id")(id, data, trx);
  };

  updateByEmail = async (email: User["email"], data: UserUpd, trx?: Transaction<DB>) => {
    return await this.#updateByKey("email")(email, data, trx);
  };

  #updateByKey =
    (key: UserKeyCols) => async (val: UserKey, data: UserUpd, trx?: Transaction<DB>) => {
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

  load = async (key: userLoader.Key) => {
    return await this.#loaders.user.load(key);
  };
}
