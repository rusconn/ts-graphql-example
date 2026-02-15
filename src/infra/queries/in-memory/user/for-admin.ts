import * as Dto from "../../../../application/queries/dto.ts";
import type { IUserQueryForAdmin } from "../../../../application/queries/user/for-admin.ts";
import type * as Domain from "../../../../domain/entities.ts";
import type { InMemoryDb } from "../../../datasources/in-memory/store.ts";
import type * as UserLoader from "./loaders/user.ts";
import { UserQueryShared } from "./shared.ts";

export class UserQueryForAdmin implements IUserQueryForAdmin {
  #db;
  #shared;

  constructor(db: InMemoryDb) {
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

    const cursorSortKey =
      cursor != null
        ? this.#db.users.get(cursor)![sortKey] //
        : undefined;

    const dbUsers = this.#db.users.values().toArray();

    const dbUsersSorted = dbUsers.sort((a, b) => {
      const [x, y] = reverse ? [b, a] : [a, b];
      return x[sortKey].getTime() - y[sortKey].getTime();
    });

    const cursored =
      cursorSortKey != null
        ? (() =>
            dbUsersSorted.filter((user) =>
              reverse
                ? user[sortKey] < cursorSortKey //
                : user[sortKey] > cursorSortKey,
            ))()
        : dbUsersSorted;

    return cursored.slice(0, limit).map(Dto.User.parseOrThrow);
  }

  async count() {
    return this.#db.users.values().toArray().length;
  }

  async load(key: UserLoader.Key) {
    return await this.#shared.load(key);
  }
}
