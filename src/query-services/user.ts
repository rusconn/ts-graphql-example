import type { Kysely } from "kysely";

import type { DB, User, UserToken } from "../db/types.ts";
import * as UserLoader from "./loaders/user.ts";

export class UserQuery {
  #db;
  #loaders;

  constructor(db: Kysely<DB>) {
    this.#db = db;
    this.#loaders = {
      user: UserLoader.create(db),
    };
  }

  static async findById(id: User["id"], db: Kysely<DB>) {
    const user = await db
      .selectFrom("users") //
      .where("id", "=", id)
      .selectAll()
      .executeTakeFirst();

    return user;
  }

  async findById(id: User["id"]) {
    const user = await this.#db
      .selectFrom("users")
      .where("id", "=", id)
      .selectAll()
      .executeTakeFirst();

    return user;
  }

  async findByRefreshToken(refreshToken: UserToken["refreshToken"]) {
    const user = await this.#db
      .selectFrom("users")
      .innerJoin("userTokens", "users.id", "userTokens.userId")
      .where("refreshToken", "=", refreshToken)
      .selectAll("users")
      .executeTakeFirst();

    return user;
  }

  async findMany(params: {
    sortKey: "createdAt" | "updatedAt";
    reverse: boolean;
    cursor?: User["id"];
    limit: number;
  }) {
    const { sortKey, reverse, cursor, limit } = params;

    const [direction, comp] = reverse //
      ? (["desc", "<"] as const)
      : (["asc", ">"] as const);

    const cursorSortKey =
      cursor != null
        ? this.#db
            .selectFrom("users") //
            .where("id", "=", cursor)
            .select(sortKey)
        : undefined;

    const users = await this.#db
      .selectFrom("users")
      .$if(cursor != null, (qb) =>
        qb.where(({ eb, refTuple, tuple }) =>
          eb(refTuple(sortKey, "id"), comp, tuple(cursorSortKey!, cursor!)),
        ),
      )
      .selectAll()
      .orderBy(sortKey, direction)
      .orderBy("id", direction)
      .limit(limit)
      .execute();

    return users;
  }

  async count() {
    const result = await this.#db
      .selectFrom("users")
      .select(({ fn }) => fn.countAll<number>().as("count"))
      .executeTakeFirst();

    return result?.count ?? 0;
  }

  async load(key: UserLoader.Key) {
    return await this.#loaders.user.load(key);
  }
}
