import type { Kysely, Transaction } from "kysely";

import type { DB } from "../db/generated/types.ts";
import type { Block } from "../db/models/block.ts";
import type { Follow } from "../db/models/follow.ts";
import type { NewUser, UpdUser, User } from "../db/models/user.ts";
import * as userId from "../db/models/user/id.ts";
import { UserBlockAPI } from "./user/block.ts";
import { UserFollowAPI } from "./user/follow.ts";
import { UserLikeAPI } from "./user/like.ts";
import * as userLoader from "./user/loader.ts";
import { UserPostAPI } from "./user/post.ts";

export class UserAPI {
  #db;
  #loaders;

  loadBlockingCount;
  loadBlockerCount;
  loadBlock;
  createBlock;
  deleteBlock;

  loadFollowingCount;
  loadFollowerCount;
  loadFollow;
  createFollow;
  deleteFollow;

  loadLikedPage;
  loadLikeCount;
  createLike;
  deleteLike;

  loadPost;
  loadPostPage;
  loadPostCount;
  countPost;
  createPost;
  updatePost;
  deletePost;

  constructor(db: Kysely<DB>) {
    this.#db = db;
    this.#loaders = {
      user: userLoader.init(db),
    };

    const blockAPI = new UserBlockAPI(db);
    this.loadBlock = blockAPI.load;
    this.loadBlockingCount = blockAPI.loadBlockeeCount;
    this.loadBlockerCount = blockAPI.loadBlockerCount;
    this.createBlock = blockAPI.create;
    this.deleteBlock = blockAPI.delete;

    const followAPI = new UserFollowAPI(db);
    this.loadFollow = followAPI.load;
    this.loadFollowingCount = followAPI.loadFolloweeCount;
    this.loadFollowerCount = followAPI.loadFollowerCount;
    this.createFollow = followAPI.create;
    this.deleteFollow = followAPI.delete;

    const likeAPI = new UserLikeAPI(db);
    this.loadLikedPage = likeAPI.loadLikedPage;
    this.loadLikeCount = likeAPI.loadCount;
    this.createLike = likeAPI.create;
    this.deleteLike = likeAPI.delete;

    const postAPI = new UserPostAPI(db);
    this.loadPost = postAPI.load;
    this.loadPostPage = postAPI.loadPage;
    this.loadPostCount = postAPI.loadCount;
    this.countPost = postAPI.count;
    this.createPost = postAPI.create;
    this.updatePost = postAPI.update;
    this.deletePost = postAPI.delete;
  }

  load = async (id: User["id"]) => {
    return await this.#loaders.user.load(id);
  };

  getById = async (id: User["id"], trx?: Transaction<DB>) => {
    return await this.getByKey("id")(id, trx);
  };

  getByName = async (name: User["name"], trx?: Transaction<DB>) => {
    return await this.getByKey("name")(name, trx);
  };

  getByEmail = async (email: User["email"], trx?: Transaction<DB>) => {
    return await this.getByKey("email")(email, trx);
  };

  getByToken = async (token: User["token"], trx?: Transaction<DB>) => {
    return await this.getByKey("token")(token, trx);
  };

  getByKey =
    (key: "id" | "name" | "email" | "token") =>
    async (
      val: User["id"] | User["name"] | User["email"] | User["token"],
      trx?: Transaction<DB>,
    ) => {
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
      .$if(cursorOrderColumn != null, (qb) =>
        qb.where(({ eb }) =>
          eb.or([
            eb(orderColumn, comp, cursorOrderColumn!),
            eb.and([
              //
              eb(orderColumn, "=", cursorOrderColumn!),
              eb("id", comp, cursor!),
            ]),
          ]),
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
    (key: "id" | "name" | "email") =>
    async (
      val: User["id"] | User["name"] | User["email"],
      data: Omit<UpdUser, "id" | "updatedAt">,
      trx?: Transaction<DB>,
    ) => {
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

  // TODO: dataloaderを使う
  loadBlockerPage = async (
    id: User["id"],
    {
      cursor,
      limit,
      reverse,
    }: {
      cursor?: Block["id"];
      limit: number;
      reverse: boolean;
    },
  ) => {
    const [direction, comp] = reverse //
      ? (["desc", "<"] as const)
      : (["asc", ">"] as const);

    const page = await this.#db
      .selectFrom("User")
      .innerJoin("Block", "User.id", "Block.blockeeId")
      .where("User.id", "=", id)
      .$if(cursor != null, (qb) => qb.where(({ eb }) => eb("Block.id", comp, cursor!)))
      .selectAll("User")
      .select("Block.id as bid")
      .orderBy("bid", direction)
      .limit(limit)
      .execute();

    return page as (User & { bid: Block["id"] })[];
  };

  // TODO: dataloaderを使う
  loadBlockingPage = async (
    id: User["id"],
    {
      cursor,
      limit,
      reverse,
    }: {
      cursor?: Block["id"];
      limit: number;
      reverse: boolean;
    },
  ) => {
    const [direction, comp] = reverse //
      ? (["desc", "<"] as const)
      : (["asc", ">"] as const);

    const page = await this.#db
      .selectFrom("User")
      .innerJoin("Block", "User.id", "Block.blockerId")
      .where("User.id", "=", id)
      .$if(cursor != null, (qb) => qb.where(({ eb }) => eb("Block.id", comp, cursor!)))
      .selectAll("User")
      .select("Block.id as bid")
      .orderBy("bid", direction)
      .limit(limit)
      .execute();

    return page as (User & { bid: Block["id"] })[];
  };

  // TODO: dataloaderを使う
  loadFollowerPage = async (
    id: User["id"],
    {
      cursor,
      limit,
      reverse,
    }: {
      cursor?: Follow["id"];
      limit: number;
      reverse: boolean;
    },
  ) => {
    const [direction, comp] = reverse //
      ? (["desc", "<"] as const)
      : (["asc", ">"] as const);

    const page = await this.#db
      .selectFrom("User")
      .innerJoin("Follow", "User.id", "Follow.followeeId")
      .where("User.id", "=", id)
      .$if(cursor != null, (qb) => qb.where(({ eb }) => eb("Follow.id", comp, cursor!)))
      .selectAll("User")
      .select("Follow.id as fid")
      .orderBy("fid", direction)
      .limit(limit)
      .execute();

    return page as (User & { fid: Follow["id"] })[];
  };

  // TODO: dataloaderを使う
  loadFollowingPage = async (
    id: User["id"],
    {
      cursor,
      limit,
      reverse,
    }: {
      cursor?: Follow["id"];
      limit: number;
      reverse: boolean;
    },
  ) => {
    const [direction, comp] = reverse //
      ? (["desc", "<"] as const)
      : (["asc", ">"] as const);

    const page = await this.#db
      .selectFrom("User")
      .innerJoin("Follow", "User.id", "Follow.followerId")
      .where("User.id", "=", id)
      .$if(cursor != null, (qb) => qb.where(({ eb }) => eb("Follow.id", comp, cursor!)))
      .selectAll("User")
      .select("Follow.id as fid")
      .orderBy("fid", direction)
      .limit(limit)
      .execute();

    return page as (User & { fid: Follow["id"] })[];
  };
}
