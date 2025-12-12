import type { Kysely, Transaction } from "kysely";

import type * as Db from "../db/types.ts";
import type { DB } from "../db/types.ts";
import type * as Domain from "../domain/user.ts";
import type { UserToken } from "../domain/user-token.ts";
import { dto } from "../dto.ts";
import { isPgError, PgErrorCode } from "../lib/pg/error.ts";
import { mappers } from "../mappers.ts";
import * as UserLoader from "./loaders/user.ts";

export class UserRepo {
  #db;
  #loaders;

  constructor(db: Kysely<DB>) {
    this.#db = db;
    this.#loaders = {
      user: UserLoader.create(db),
    };
  }

  findById = async (id: Domain.User["id"], trx?: Transaction<DB>) => {
    const user = await (trx ?? this.#db)
      .selectFrom("userCredentials")
      .innerJoin("users", "userCredentials.userId", "users.id")
      .where("id", "=", id)
      .selectAll("users")
      .select("userCredentials.password")
      .$if(trx != null, (qb) => qb.forUpdate())
      .executeTakeFirst();

    return user && mappers.user.toDomain(user);
  };

  findByEmail = async (email: Domain.User["email"], trx?: Transaction<DB>) => {
    const user = await (trx ?? this.#db)
      .selectFrom("userCredentials")
      .innerJoin("users", "userCredentials.userId", "users.id")
      .where("email", "=", email)
      .selectAll("users")
      .select("userCredentials.password")
      .$if(trx != null, (qb) => qb.forUpdate())
      .executeTakeFirst();

    return user && mappers.user.toDomain(user);
  };

  findBaseById = async (id: Domain.User["id"], trx?: Transaction<DB>) => {
    const user = await this.#db
      .selectFrom("users")
      .where("id", "=", id)
      .selectAll()
      .$if(trx != null, (qb) => qb.forUpdate())
      .executeTakeFirst();

    return user && dto.userBase.from(user);
  };

  findBaseByToken = async (token: UserToken["token"], trx?: Transaction<DB>) => {
    const user = await this.#db
      .selectFrom("users")
      .innerJoin("userTokens", "users.id", "userTokens.userId")
      .where("token", "=", token)
      .selectAll("users")
      .$if(trx != null, (qb) => qb.forUpdate())
      .executeTakeFirst();

    return user && dto.userBase.from(user);
  };

  findMany = async (params: {
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
      .executeTakeFirst();

    return result?.count ?? 0;
  };

  save = async (user: Domain.User, trx?: Transaction<DB>) => {
    const db = mappers.user.toDb(user);

    try {
      if (trx) {
        await this.#saveCore(trx, db.user, db.userCredential);
      } else {
        await this.#db.transaction().execute(async (trx) => {
          await this.#saveCore(trx, db.user, db.userCredential);
        });
      }

      return { type: "Success" } as const;
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

  async #saveCore(trx: Transaction<DB>, user: Db.User, userCredential: Db.UserCredential) {
    await trx
      .insertInto("users")
      .values(user)
      .onConflict((oc) => oc.column("id").doUpdateSet(user))
      .executeTakeFirstOrThrow();
    await trx
      .insertInto("userCredentials")
      .values(userCredential)
      .onConflict((oc) => oc.column("userId").doUpdateSet(userCredential))
      .executeTakeFirstOrThrow();
  }

  delete = async (id: Domain.User["id"], trx?: Transaction<DB>) => {
    const result = await (trx ?? this.#db)
      .deleteFrom("users")
      .where("id", "=", id)
      .executeTakeFirst();

    return result.numDeletedRows > 0n;
  };

  load = async (key: UserLoader.Key) => {
    return await this.#loaders.user.load(key);
  };
}
