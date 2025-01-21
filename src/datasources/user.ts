import type { Kysely, Transaction } from "kysely";

import type { DB } from "../db/generated/types.ts";
import type { NewUser, UpdUser, User, UserKey, UserKeyCols } from "../db/models/user.ts";
import * as userId from "../db/models/user/id.ts";
import * as blockerCountLoader from "./loaders/blockerCount.ts";
import * as blockersLoader from "./loaders/blockers.ts";
import * as blockingCountLoader from "./loaders/blockingCount.ts";
import * as blockingsLoader from "./loaders/blockings.ts";
import * as followerCountLoader from "./loaders/followerCount.ts";
import * as followersLoader from "./loaders/followers.ts";
import * as followingCountLoader from "./loaders/followingCount.ts";
import * as followingsLoader from "./loaders/followings.ts";
import * as likersLoader from "./loaders/likers.ts";
import * as userLoader from "./loaders/user.ts";

export type { Blocker } from "./loaders/blockers.ts";
export type { Blocking } from "./loaders/blockings.ts";
export type { Follower } from "./loaders/followers.ts";
export type { Following } from "./loaders/followings.ts";
export type { Liker } from "./loaders/likers.ts";

export class UserAPI {
  #db;
  #loaders;

  constructor(db: Kysely<DB>) {
    this.#db = db;
    this.#loaders = {
      user: userLoader.init(db),
      blockers: blockersLoader.initClosure(db),
      blockerCount: blockerCountLoader.init(db),
      blockings: blockingsLoader.initClosure(db),
      blockingCount: blockingCountLoader.init(db),
      followers: followersLoader.initClosure(db),
      followerCount: followerCountLoader.init(db),
      followings: followingsLoader.initClosure(db),
      followingCount: followingCountLoader.init(db),
      likers: likersLoader.initClosure(db),
    };
  }

  getById = async (id: User["id"], trx?: Transaction<DB>) => {
    return await this.getByKey("id")(id, trx);
  };

  getByName = async (name: User["name"], trx?: Transaction<DB>) => {
    return await this.getByKey("name")(name, trx);
  };

  getByEmail = async (email: User["email"], trx?: Transaction<DB>) => {
    return await this.getByKey("email")(email, trx);
  };

  getByToken = async (token: Exclude<User["token"], null>, trx?: Transaction<DB>) => {
    return await this.getByKey("token")(token, trx);
  };

  getByKey = (key: UserKeyCols) => async (val: UserKey, trx?: Transaction<DB>) => {
    const user = await (trx ?? this.#db)
      .selectFrom("User")
      .where(key, "=", val)
      .selectAll()
      .$if(trx != null, (qb) => qb.forUpdate())
      .executeTakeFirst();

    return user as User | undefined;
  };

  getPage = async ({
    cursor,
    sortKey,
    limit,
    reverse,
  }: {
    cursor?: User["id"];
    sortKey: "createdAt" | "updatedAt";
    limit: number;
    reverse: boolean;
  }) => {
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
            //
            refTuple(orderColumn, "id"),
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
      .select(({ fn }) => fn.countAll().as("count"))
      .executeTakeFirstOrThrow();

    return Number(result.count);
  };

  create = async (data: Omit<NewUser, "id" | "updatedAt">, trx?: Transaction<DB>) => {
    const { id, date } = userId.genWithDate();

    const user = await (trx ?? this.#db)
      .insertInto("User")
      .values({
        id,
        updatedAt: date,
        ...data,
      })
      .returningAll()
      .executeTakeFirst();

    return user as User | undefined;
  };

  updateById = async (
    id: User["id"],
    data: Omit<UpdUser, "id" | "updatedAt">,
    trx?: Transaction<DB>,
  ) => {
    return await this.updateByKey("id")(id, data, trx);
  };

  updateByEmail = async (
    email: User["email"],
    data: Omit<UpdUser, "id" | "updatedAt">,
    trx?: Transaction<DB>,
  ) => {
    return await this.updateByKey("email")(email, data, trx);
  };

  updateByKey =
    (key: UserKeyCols) =>
    async (val: UserKey, data: Omit<UpdUser, "id" | "updatedAt">, trx?: Transaction<DB>) => {
      const user = await (trx ?? this.#db)
        .updateTable("User")
        .where(key, "=", val)
        .set({
          updatedAt: new Date(),
          ...data,
        })
        .returningAll()
        .executeTakeFirst();

      return user as User | undefined;
    };

  delete = async (id: User["id"], trx?: Transaction<DB>) => {
    const user = await (trx ?? this.#db)
      .deleteFrom("User")
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirst();

    return user as User | undefined;
  };

  load = async (key: userLoader.Key) => {
    return await this.#loaders.user.load(key);
  };

  loadBlockerPage = async (key: blockersLoader.Key, params: blockersLoader.Params) => {
    return await this.#loaders.blockers(params).load(key);
  };

  loadBlockerCount = async (key: blockerCountLoader.Key) => {
    return await this.#loaders.blockerCount.load(key);
  };

  loadBlockingPage = async (key: blockingsLoader.Key, params: blockingsLoader.Params) => {
    return await this.#loaders.blockings(params).load(key);
  };

  loadBlockingCount = async (key: blockingCountLoader.Key) => {
    return await this.#loaders.blockingCount.load(key);
  };

  loadFollowerPage = async (key: followersLoader.Key, params: followersLoader.Params) => {
    return await this.#loaders.followers(params).load(key);
  };

  loadFollowerCount = async (key: followerCountLoader.Key) => {
    return await this.#loaders.followerCount.load(key);
  };

  loadFollowingPage = async (key: followingsLoader.Key, params: followingsLoader.Params) => {
    return await this.#loaders.followings(params).load(key);
  };

  loadFollowingCount = async (key: followingCountLoader.Key) => {
    return await this.#loaders.followingCount.load(key);
  };

  loadLikerPage = async (key: likersLoader.Key, params: likersLoader.Params) => {
    return await this.#loaders.likers(params).load(key);
  };
}
