import type { Kysely } from "kysely";
import type { Except, OverrideProperties } from "type-fest";

import type { DB } from "../db/types.ts";
import * as Domain from "../domain/user.ts";
import { dto } from "../dto.ts";
import { isPgError, PgErrorCode } from "../lib/pg/error.ts";
import { mappers } from "../mappers.ts";
import * as UserLoader from "./loaders/user.ts";

type UserNew = OverrideProperties<
  Except<Domain.User, "id" | "createdAt" | "updatedAt">, //
  { password: string }
>;

type UserUpd = Partial<Except<UserNew, "password">>;

export class UserRepo {
  #db;
  #loaders;

  constructor(db: Kysely<DB>) {
    this.#db = db;
    this.#loaders = {
      user: UserLoader.create(db),
    };
  }

  getById = async (id: Domain.User["id"]) => {
    const user = await this.#db
      .selectFrom("users")
      .where("id", "=", id)
      .selectAll()
      .executeTakeFirst();

    return user && dto.userBase.from(user);
  };

  getByToken = async (token: Domain.UserToken["token"]) => {
    const user = await this.#db
      .selectFrom("users")
      .innerJoin("userTokens", "users.id", "userTokens.userId")
      .where("token", "=", await Domain.UserToken.hash(token))
      .selectAll("users")
      .executeTakeFirst();

    return user && dto.userBase.from(user);
  };

  getWithCredentialById = async (id: Domain.User["id"]) => {
    const user = await this.#db
      .selectFrom("userCredentials")
      .innerJoin("users", "userCredentials.userId", "users.id")
      .where("id", "=", id)
      .selectAll("users")
      .select("userCredentials.password")
      .executeTakeFirst();

    return user && mappers.user.toDomain(user);
  };

  getWithCredentialByEmail = async (email: Domain.User["email"]) => {
    const user = await this.#db
      .selectFrom("userCredentials")
      .innerJoin("users", "userCredentials.userId", "users.id")
      .where("email", "=", email)
      .selectAll("users")
      .select("userCredentials.password")
      .executeTakeFirst();

    return user && mappers.user.toDomain(user);
  };

  getPage = async (params: {
    sortKey: "createdAt" | "updatedAt";
    reverse: boolean;
    cursor?: Domain.User["id"];
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
        .selectFrom("users")
        .where("id", "=", cursor)
        .select(orderColumn);

    const users = await this.#db
      .selectFrom("users")
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

    return users.map(dto.userBase.from);
  };

  count = async () => {
    const result = await this.#db
      .selectFrom("users")
      .select(({ fn }) => fn.countAll<number>().as("count"))
      .executeTakeFirstOrThrow();

    return result.count;
  };

  create = async ({ password: source, role, ...rest }: UserNew) => {
    const { id, date } = Domain.UserId.genWithDate();
    const password = await Domain.UserPassword.hash(source);
    const token = Domain.UserToken.gen();
    const hashed = await Domain.UserToken.hash(token);

    try {
      return await this.#db.transaction().execute(async (trx) => {
        const user = await trx
          .insertInto("users")
          .values({
            ...rest,
            id,
            updatedAt: date,
            role: mappers.user.role.toDb(role),
          })
          .returningAll()
          .executeTakeFirstOrThrow();
        const _userCredential = await trx
          .insertInto("userCredentials")
          .values({ userId: user.id, password })
          .returning("userId")
          .executeTakeFirstOrThrow();
        const _userToken = await trx
          .insertInto("userTokens")
          .values({ userId: user.id, token: hashed })
          .returning("token")
          .executeTakeFirstOrThrow();

        const userWithToken = dto.userWithToken.from({ ...user, token });

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

  updateById = async (id: Domain.User["id"], { role, ...rest }: UserUpd) => {
    try {
      const user = await this.#db
        .updateTable("users")
        .where("id", "=", id)
        .set({
          ...rest,
          ...(role && {
            role: mappers.user.role.toDb(role),
          }),
          updatedAt: new Date(),
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      return { type: "Success", ...dto.userBase.from(user) } as const;
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

  updatePasswordById = async (id: Domain.User["id"], source: string) => {
    const userPassword = await this.#db
      .updateTable("userCredentials")
      .where("userId", "=", id)
      .set({ password: await Domain.UserPassword.hash(source) })
      .returning("userId")
      .executeTakeFirst();

    return userPassword?.userId as Domain.User["id"] | undefined;
  };

  updateTokenById = async (id: Domain.User["id"]) => {
    const token = Domain.UserToken.gen();
    const hashed = await Domain.UserToken.hash(token);

    const userToken = await this.#db
      .insertInto("userTokens")
      .values({ userId: id, token: hashed })
      .onConflict((oc) => oc.column("userId").doUpdateSet({ token: hashed }))
      .returning("token")
      .executeTakeFirst();

    return userToken && token;
  };

  updateTokenByToken = async (oldToken: Domain.UserToken["token"]) => {
    const newToken = Domain.UserToken.gen();

    const userToken = await this.#db
      .updateTable("userTokens")
      .where("token", "=", await Domain.UserToken.hash(oldToken))
      .set({ token: await Domain.UserToken.hash(newToken) })
      .returning("token")
      .executeTakeFirst();

    return userToken && newToken;
  };

  deleteById = async (id: Domain.User["id"]) => {
    const user = await this.#db
      .deleteFrom("users")
      .where("id", "=", id)
      .returning("id")
      .executeTakeFirst();

    return user != null;
  };

  deleteTokenById = async (id: Domain.User["id"]) => {
    const userToken = await this.#db
      .deleteFrom("userTokens")
      .where("userId", "=", id)
      .returning("userId")
      .executeTakeFirst();

    return userToken != null;
  };

  load = async (key: UserLoader.Key) => {
    return await this.#loaders.user.load(key);
  };
}
