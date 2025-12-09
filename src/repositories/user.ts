import type { Kysely } from "kysely";
import type { Except } from "type-fest";

import type { DB } from "../db/types.ts";
import { isPgError, PgErrorCode } from "../lib/pg/error.ts";
import {
  type User,
  type UserCredential,
  type UserEmail,
  UserId,
  UserPassword,
  UserToken,
} from "../models/user.ts";
import * as UserLoader from "./loaders/user.ts";

type UserNew = Except<User, "id" | "updatedAt"> & {
  email: UserEmail.UserEmail;
  password: string;
};

type UserUpd = Partial<Except<UserNew, "password">>;

type UserWithCredential = User & Pick<UserCredential, "password">;

export class UserRepo {
  #db;
  #loaders;

  constructor(db: Kysely<DB>) {
    this.#db = db;
    this.#loaders = {
      user: UserLoader.create(db),
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

  getByToken = async (token: UserToken["token"]) => {
    const user = await this.#db
      .selectFrom("User")
      .innerJoin("UserToken", "User.id", "UserToken.userId")
      .where("token", "=", await UserToken.hash(token))
      .selectAll("User")
      .executeTakeFirst();

    return user as User | undefined;
  };

  getWithCredentialById = async (id: User["id"]) => {
    const user = await this.#db
      .selectFrom("UserCredential")
      .innerJoin("User", "UserCredential.userId", "User.id")
      .where("id", "=", id)
      .selectAll("User")
      .select("UserCredential.password")
      .executeTakeFirst();

    return user as UserWithCredential | undefined;
  };

  getWithCredentialByEmail = async (email: User["email"]) => {
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
    const token = UserToken.gen();
    const hashed = await UserToken.hash(token);

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
          .values({ userId: user.id, updatedAt: date, token: hashed })
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
    try {
      const user = await this.#db
        .updateTable("User")
        .where("id", "=", id)
        .set({ updatedAt: new Date(), ...data })
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
    const token = UserToken.gen();

    const userToken = await this.#db
      .updateTable("UserToken")
      .where("userId", "=", id)
      .set({ updatedAt: new Date(), token: await UserToken.hash(token) })
      .returning("token")
      .executeTakeFirst();

    return userToken && token;
  };

  updateTokenByToken = async (oldToken: UserToken["token"]) => {
    const newToken = UserToken.gen();

    const userToken = await this.#db
      .updateTable("UserToken")
      .where("token", "=", await UserToken.hash(oldToken))
      .set({ updatedAt: new Date(), token: await UserToken.hash(newToken) })
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

  load = async (key: UserLoader.Key) => {
    return await this.#loaders.user.load(key);
  };
}
