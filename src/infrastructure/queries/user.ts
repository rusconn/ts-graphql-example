import type { ReadonlyKysely } from "kysely/readonly";

import * as Dto from "../../application/dto.ts";
import type { IUserQueryForAdmin } from "../../application/queries/user/for-admin.ts";
import type { IUserQueryForUser } from "../../application/queries/user/for-user.ts";
import type * as Domain from "../../domain/entities.ts";
import type { DB } from "../datasources/db/types.ts";
import * as UserLoader from "./user/loaders/user.ts";

export class UserQuery implements IUserQueryForAdmin, IUserQueryForUser {
  #db;
  #loaders;

  constructor(db: ReadonlyKysely<DB>, tenantId?: Domain.User.Type["id"]) {
    this.#db = db;
    this.#loaders = {
      user: UserLoader.create(db, tenantId),
    };
  }

  async find(id: Domain.User.Type["id"]) {
    const user = await this.#loaders.user.load(id);
    return user && Dto.User.parseOrThrow(user);
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
}
