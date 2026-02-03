import type { Kysely } from "kysely";

import type { DB, User, UserToken } from "../../db/types.ts";
import type * as UserLoader from "./loaders/user.ts";
import { UserQueryShared } from "./shared.ts";

export class UserQueryForAdmin {
  #db;
  #shared;

  constructor(db: Kysely<DB>) {
    this.#db = db;
    this.#shared = new UserQueryShared(db);
  }

  async findById(id: User["id"]) {
    return await this.#shared.findById(id);
  }

  async findByRefreshToken(refreshToken: UserToken["refreshToken"]) {
    return await this.#shared.findByRefreshToken(refreshToken);
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
    return await this.#shared.load(key);
  }
}
