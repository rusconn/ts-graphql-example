import type { Kysely, Transaction } from "kysely";

import type { DB } from "../../db/generated/types.ts";
import type { NewPost, Post, UpdPost } from "../../db/models/post.ts";
import * as postId from "../../db/models/post/id.ts";
import * as userPostLoader from "./post/loader/userPost.ts";
import * as userPostCountLoader from "./post/loader/userPostCount.ts";
import * as userPostsLoader from "./post/loader/userPosts.ts";

export class UserPostAPI {
  #db;
  #loaders;

  constructor(db: Kysely<DB>) {
    this.#db = db;
    this.#loaders = {
      userPost: userPostLoader.init(db),
      userPosts: userPostsLoader.initClosure(db),
      userPostCount: userPostCountLoader.init(db),
    };
  }

  load = async (userId: Post["userId"], postId: Post["id"]) => {
    return await this.#loaders.userPost.load({ id: postId, userId });
  };

  loads = async (
    userId: Post["userId"],
    params: Omit<userPostsLoader.Params, "orderColumn" | "direction" | "comp"> & {
      sortKey: "createdAt" | "updatedAt";
      reverse: boolean;
    },
  ) => {
    return await this.#loaders.userPosts(params).load(userId);
  };

  loadCount = async (userId: Post["userId"]) => {
    return await this.#loaders.userPostCount.load(userId);
  };

  count = async (userId: Post["userId"]) => {
    const result = await this.#db
      .selectFrom("Post")
      .where("userId", "=", userId)
      .select(({ fn }) => fn.countAll().as("count"))
      .executeTakeFirstOrThrow();

    return Number(result.count);
  };

  create = async (
    userId: Post["userId"],
    data: Omit<NewPost, "userId" | "id" | "updatedAt">,
    trx?: Transaction<DB>,
  ) => {
    const { id, date } = postId.genWithDate();

    const post = await (trx ?? this.#db)
      .insertInto("Post")
      .values({
        id,
        updatedAt: date,
        ...data,
        userId,
      })
      .returningAll()
      .executeTakeFirst();

    return post as Post | undefined;
  };

  update = async (
    key: {
      userId: Post["userId"];
      postId: Post["id"];
    },
    data: Omit<UpdPost, "userId" | "id" | "updatedAt">,
    trx?: Transaction<DB>,
  ) => {
    const post = await (trx ?? this.#db)
      .updateTable("Post")
      .where("userId", "=", key.userId)
      .where("id", "=", key.postId)
      .set({
        updatedAt: new Date(),
        ...data,
      })
      .returningAll()
      .executeTakeFirst();

    return post as Post | undefined;
  };

  delete = async (
    key: {
      userId: Post["userId"];
      postId: Post["id"];
    },
    trx?: Transaction<DB>,
  ) => {
    const post = await (trx ?? this.#db)
      .deleteFrom("Post")
      .where("userId", "=", key.userId)
      .where("id", "=", key.postId)
      .returningAll()
      .executeTakeFirst();

    return post as Post | undefined;
  };
}
