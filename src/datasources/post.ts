import type { Kysely, Transaction } from "kysely";

import { type DB, PostStatus } from "../db/generated/types.ts";
import type { NewPost, Post, PostKey, UpdPost } from "../db/models/post.ts";
import * as postId from "../db/models/post/id.ts";
import * as repliesLoader from "./loaders/replies.ts";
import * as replyCountLoader from "./loaders/replyCount.ts";
import * as userFavCountLoader from "./loaders/userFavCount.ts";
import * as userFavsLoader from "./loaders/userFavs.ts";
import * as userPostLoader from "./loaders/userPost.ts";
import * as userPostCountLoader from "./loaders/userPostCount.ts";
import * as userPostsLoader from "./loaders/userPosts.ts";

export type { Fav } from "./loaders/userFavs.ts";

export class PostAPI {
  #db;
  #loaders;

  constructor(db: Kysely<DB>) {
    this.#db = db;
    this.#loaders = {
      userPost: userPostLoader.init(db),
      userPosts: userPostsLoader.initClosure(db),
      userPostCount: userPostCountLoader.init(db),
      userFavs: userFavsLoader.initClosure(db),
      userFavCount: userFavCountLoader.init(db),
      replyCount: replyCountLoader.init(db),
      replies: repliesLoader.initClosure(db),
    };
  }

  getById = async (id: Post["id"], trx?: Transaction<DB>) => {
    const post = await (trx ?? this.#db)
      .selectFrom("Post")
      .where("id", "=", id)
      .selectAll()
      .$if(trx != null, (qb) => qb.forUpdate())
      .executeTakeFirst();

    return post as Post | undefined;
  };

  getPage = async ({
    cursor,
    sortKey,
    limit,
    reverse,
  }: {
    cursor?: Post["id"];
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
        .selectFrom("Post")
        .where("id", "=", cursor)
        .select(orderColumn);

    const page = await this.#db
      .selectFrom("Post")
      .$if(cursorOrderColumn != null, (qb) =>
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

    return page as Post[];
  };

  count = async () => {
    const result = await this.#db
      .selectFrom("Post")
      .select(({ fn }) => fn.countAll().as("count"))
      .executeTakeFirstOrThrow();

    return Number(result.count);
  };

  create = async (data: Omit<NewPost, "id" | "updatedAt">, trx?: Transaction<DB>) => {
    const { id, date } = postId.genWithDate();

    const post = await (trx ?? this.#db)
      .insertInto("Post")
      .values({
        id,
        updatedAt: date,
        ...data,
      })
      .returningAll()
      .executeTakeFirst();

    return post as Post | undefined;
  };

  update = async (
    { id, userId, parentId }: PostKey,
    data: Omit<UpdPost, "id" | "updatedAt">,
    trx?: Transaction<DB>,
  ) => {
    const post = await (trx ?? this.#db)
      .updateTable("Post")
      .where("id", "=", id)
      .$if(userId != null, (qb) => qb.where("userId", "=", userId!))
      .$if(parentId != null, (qb) => qb.where("parentId", "=", parentId!))
      .where("status", "=", "Active")
      .set({
        updatedAt: new Date(),
        ...data,
      })
      .returningAll()
      .executeTakeFirst();

    return post as Post | undefined;
  };

  delete = async ({ id, userId, parentId }: PostKey, trx?: Transaction<DB>) => {
    const post = await (trx ?? this.#db)
      .updateTable("Post")
      .where("id", "=", id)
      .$if(userId != null, (qb) => qb.where("userId", "=", userId!))
      .$if(parentId != null, (qb) => qb.where("parentId", "=", parentId!))
      .where("status", "=", "Active")
      .set({
        updatedAt: new Date(),
        content: "",
        status: PostStatus.Deleted,
      })
      .returningAll()
      .executeTakeFirst();

    return post as Post | undefined;
  };

  loadTheir = async (userId: userPostLoader.Key["userId"], postId: userPostLoader.Key["id"]) => {
    return await this.#loaders.userPost.load({ id: postId, userId });
  };

  loadTheirPage = async (key: userPostsLoader.Key, params: userPostsLoader.Params) => {
    return await this.#loaders.userPosts(params).load(key);
  };

  loadTheirCount = async (key: userPostCountLoader.Key) => {
    return await this.#loaders.userPostCount.load(key);
  };

  loadTheirFavPage = async (key: userFavsLoader.Key, params: userFavsLoader.Params) => {
    return await this.#loaders.userFavs(params).load(key);
  };

  loadTheirFavCount = async (key: userFavCountLoader.Key) => {
    return await this.#loaders.userFavCount.load(key);
  };

  loadReplyPage = async (key: repliesLoader.Key, params: repliesLoader.Params) => {
    return await this.#loaders.replies(params).load(key);
  };

  loadReplyCount = async (key: repliesLoader.Key) => {
    return await this.#loaders.replyCount.load(key);
  };
}
