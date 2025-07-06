import type { Kysely } from "kysely";

import type { DB } from "../db/types.ts";
import { isPgError, PgErrorCode } from "../lib/pg/error.ts";
import * as UserId from "../models/user/id.ts";
import * as UserPassword from "../models/user/password.ts";
import type { UserToken } from "../models/user/token.ts";
import * as UserTokens from "../models/user/token.ts";
import type { User, UserNew, UserUpd, UserWithCredential } from "../models/user.ts";
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
    const user = await this.#db
      .selectFrom("User")
      .where("id", "=", id)
      .selectAll()
      .executeTakeFirst();

    return user as User | undefined;
  };

  getByToken = async (token: UserToken) => {
    const user = await this.#db
      .selectFrom("User")
      .innerJoin("UserToken", "User.id", "UserToken.userId")
      .where("token", "=", await UserTokens.hash(token))
      .selectAll("User")
      .executeTakeFirst();

    return user as User | undefined;
  };

  getWithCredencialById = async (id: User["id"]) => {
    const user = await this.#db
      .selectFrom("UserCredential")
      .innerJoin("User", "UserCredential.userId", "User.id")
      .where("id", "=", id)
      .selectAll("User")
      .select("UserCredential.password")
      .executeTakeFirst();

    return user as UserWithCredential | undefined;
  };

  getWithCredencialByEmail = async (email: User["email"]) => {
    const user = await this.#db
      .selectFrom("UserCredential")
      .innerJoin("User", "UserCredential.userId", "User.id")
      .where("email", "=", email)
      .selectAll("User")
      .select("UserCredential.password")
      .executeTakeFirst();

    return user as UserWithCredential | undefined;
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

  create = async ({ password: source, ...data }: UserNew) => {
    const { id, date } = UserId.genWithDate();
    const password = await UserPassword.hash(source);
    const token = UserTokens.gen();
    const hashed = await UserTokens.hash(token);

    try {
      return await this.#db.transaction().execute(async (trx) => {
        const user = await trx
          .insertInto("User")
          .values({ id, updatedAt: date, ...data })
          .returningAll()
          .executeTakeFirstOrThrow();
        const _userCredential = await trx
          .insertInto("UserCredential")
          .values({ userId: user.id, updatedAt: date, password })
          .returning("userId")
          .executeTakeFirstOrThrow();
        const _userToken = await trx
          .insertInto("UserToken")
          .values({ userId: user.id, updatedAt: new Date(), token: hashed })
          .returning("token")
          .executeTakeFirstOrThrow();

        const userWithToken = { ...(user as User), token };

        return { type: "Success", ...userWithToken } as const;
      });
    } catch (e) {
      if (isPgError(e)) {
        if (e.code === PgErrorCode.UniqueViolation) {
          if (e.constraint?.includes("email")) {
            return { type: "EmailAlreadyExists" } as const;
          }
        }
      }

      return {
        type: "Unknown",
        e: e instanceof Error ? e : new Error("unknown", { cause: e }),
      } as const;
    }
  };

  updateById = async (id: User["id"], data: UserUpd) => {
    const date = new Date();

    try {
      const user = await this.#db
        .updateTable("User")
        .where("id", "=", id)
        .set({ updatedAt: date, ...data })
        .returningAll()
        .executeTakeFirstOrThrow();

      return { type: "Success", ...(user as User) } as const;
    } catch (e) {
      if (isPgError(e)) {
        if (e.code === PgErrorCode.UniqueViolation) {
          if (e.constraint?.includes("email")) {
            return { type: "EmailAlreadyExists" } as const;
          }
        }
      }

      return {
        type: "Unknown",
        e: e instanceof Error ? e : new Error("unknown", { cause: e }),
      } as const;
    }
  };

  updatePasswordById = async (id: User["id"], source: string) => {
    const userPassword = await this.#db
      .updateTable("UserCredential")
      .where("userId", "=", id)
      .set({ updatedAt: new Date(), password: await UserPassword.hash(source) })
      .returning("userId")
      .executeTakeFirst();

    return userPassword?.userId as UserWithCredential["id"] | undefined;
  };

  updateTokenById = async (id: User["id"]) => {
    const token = UserTokens.gen();

    const userToken = await this.#db
      .updateTable("UserToken")
      .where("userId", "=", id)
      .set({ updatedAt: new Date(), token: await UserTokens.hash(token) })
      .returning("token")
      .executeTakeFirst();

    return userToken && token;
  };

  updateTokenByToken = async (oldToken: UserToken) => {
    const newToken = UserTokens.gen();

    const userToken = await this.#db
      .updateTable("UserToken")
      .where("token", "=", await UserTokens.hash(oldToken))
      .set({ updatedAt: new Date(), token: await UserTokens.hash(newToken) })
      .returning("token")
      .executeTakeFirst();

    return userToken && newToken;
  };

  deleteById = async (id: User["id"]) => {
    const user = await this.#db
      .deleteFrom("User")
      .where("id", "=", id)
      .returning("id")
      .executeTakeFirst();

    return user != null;
  };

  deleteTokenById = async (id: User["id"]) => {
    const userToken = await this.#db
      .deleteFrom("UserToken")
      .where("userId", "=", id)
      .returning("userId")
      .executeTakeFirst();

    return userToken != null;
  };

  load = async (key: userLoader.Key) => {
    return await this.#loaders.user.load(key);
  };
}
