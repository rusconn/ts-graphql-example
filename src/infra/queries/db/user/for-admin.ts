import type { Kysely } from "kysely";

import type * as Domain from "../../../../domain/models.ts";
import * as Dto from "../../../../graphql/_dto.ts";
import type { IUserQueryForAdmin } from "../../../../graphql/_queries/user/for-admin.ts";
import type { DB } from "../../../datasources/_shared/types.ts";
import type * as UserLoader from "./loaders/user.ts";
import { UserQueryShared } from "./shared.ts";

export class UserQueryForAdmin implements IUserQueryForAdmin {
  #db;
  #shared;

  constructor(db: Kysely<DB>) {
    this.#db = db;
    this.#shared = new UserQueryShared(db);
  }

  async find(id: Domain.User.Type["id"]) {
    return await this.#shared.find(id);
  }

  async findByRefreshToken(token: Domain.RefreshToken.Type["token"]) {
    return await this.#shared.findByRefreshToken(token);
  }

  async findMany(params: {
    sortKey: "createdAt" | "updatedAt";
    reverse: boolean;
    cursor?: Domain.User.Type["id"];
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

    return users.map(Dto.User.parseOrThrow);
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
