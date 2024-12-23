import type { Kysely } from "kysely";
import type { OverrideProperties } from "type-fest";

import type { UserInsert, UserSelect, UserUpdate } from "../db/models.ts";
import type { DB } from "../db/types.ts";
import { loaders } from "./user/loaders.ts";
import type { UserId } from "./user/types/id.ts";
import * as userId from "./user/types/id.ts";
import type { UserToken } from "./user/types/token.ts";

export type User = OverrideProperties<
  UserSelect,
  {
    id: UserId;
    token: UserToken | null;
  }
>;

type NewUser = OverrideProperties<
  UserInsert,
  {
    token: UserToken | null;
  }
>;

type UpdUser = OverrideProperties<
  UserUpdate,
  {
    token?: UserToken | null;
  }
>;

export class UserAPI {
  #db;
  #loaders;

  constructor(db: Kysely<DB>) {
    this.#db = db;
    this.#loaders = {
      user: loaders.user.init(db),
    };
  }

  getById = async (id: User["id"]) => {
    const got = await this.#loaders.user.load({ id });

    return got as User | undefined;
  };

  getByEmail = async (email: User["email"]) => {
    const got = await this.#db
      .selectFrom("User")
      .where("email", "=", email)
      .selectAll()
      .executeTakeFirst();

    return got as User | undefined;
  };

  getByToken = async (token: User["token"]) => {
    const got = await this.#db
      .selectFrom("User")
      .where("token", "=", token)
      .selectAll()
      .executeTakeFirst();

    return got as User | undefined;
  };

  getPage = async ({
    cursor,
    limit,
    sortKey,
    reverse,
  }: {
    cursor?: Pick<User, "id">;
    limit: number;
    sortKey: "createdAt" | "updatedAt";
    reverse: boolean;
  }) => {
    const orderKey = sortKey === "createdAt" ? "id" : sortKey;

    const cursorOrderKey =
      cursor &&
      this.#db //
        .selectFrom("User")
        .where("id", "=", cursor.id)
        .select(orderKey);

    const [direction, comp] = reverse //
      ? (["desc", "<"] as const)
      : (["asc", ">"] as const);

    const got = await this.#db
      .selectFrom("User")
      .$if(cursorOrderKey != null, (qb) =>
        qb.where(({ eb }) =>
          eb.or([
            eb(orderKey, comp, cursorOrderKey!),
            eb.and([
              //
              eb(orderKey, "=", cursorOrderKey!),
              eb("id", comp, cursor!.id),
            ]),
          ]),
        ),
      )
      .selectAll()
      .orderBy(orderKey, direction)
      .orderBy("id", direction)
      .limit(limit)
      .execute();

    return got as User[];
  };

  count = async () => {
    const got = await this.#db
      .selectFrom("User")
      .select(({ fn }) => fn.countAll().as("count"))
      .executeTakeFirstOrThrow();

    return Number(got.count);
  };

  create = async (data: Omit<NewUser, "id" | "updatedAt">) => {
    const { id, date } = userId.genWithDate();

    const got = await this.#db
      .insertInto("User")
      .values({ id, updatedAt: date, ...data })
      .returningAll()
      .executeTakeFirst();

    return got as User | undefined;
  };

  updateById = async (id: User["id"], data: Omit<UpdUser, "updatedAt">) => {
    const got = await this.#db
      .updateTable("User")
      .where("id", "=", id)
      .set({ updatedAt: new Date(), ...data })
      .returningAll()
      .executeTakeFirst();

    return got as User | undefined;
  };

  updateByEmail = async (email: User["email"], data: Omit<UpdUser, "updatedAt">) => {
    const got = await this.#db
      .updateTable("User")
      .where("email", "=", email)
      .set({ updatedAt: new Date(), ...data })
      .returningAll()
      .executeTakeFirst();

    return got as User | undefined;
  };

  deleteById = async (id: User["id"]) => {
    const got = await this.#db
      .deleteFrom("User")
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirst();

    return got as User | undefined;
  };
}
