import type { Kysely, Transaction } from "kysely";

import { type DB, PostStatus } from "../db/types.ts";
import { PgErrorCode, isPgError } from "../lib/pg/error.ts";
import type { Post, PostKey, PostNew, PostUpd } from "../models/post.ts";
import * as PostId from "../models/post/id.ts";
import * as repliesLoader from "./loaders/replies.ts";
import * as replyCountLoader from "./loaders/replyCount.ts";
import * as userFavCountLoader from "./loaders/userFavCount.ts";
import * as userFavsLoader from "./loaders/userFavs.ts";
import * as userPostLoader from "./loaders/userPost.ts";
import * as userPostCountLoader from "./loaders/userPostCount.ts";
import * as userPostsLoader from "./loaders/userPosts.ts";

export type { Reply } from "./loaders/replies.ts";
export type { Fav } from "./loaders/userFavs.ts";

export class PostAPI {
  #db;
  #loaders;

  constructor(db: Kysely<DB>) {
    this.#db = db;
    this.#loaders = {
      userPost: userPostLoader.init(db),
      userPosts: userPostsLoader.init(db),
      userPostCount: userPostCountLoader.init(db),
      userFavs: userFavsLoader.init(db),
      userFavCount: userFavCountLoader.init(db),
      replyCount: replyCountLoader.init(db),
      replies: repliesLoader.init(db),
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

  getPage = async (params: {
    sortKey: "createdAt" | "updatedAt";
    reverse: boolean;
    cursor?: Post["id"];
    limit: number;
  }) => {
    const { sortKey, reverse, cursor, limit } = params;

    const orderColumn = sortKey === "createdAt" ? "id" : sortKey;

    const [direction, comp] = reverse
      ? (["desc", "<"] as const) //
      : (["asc", ">"] as const);

    const cursorOrderColumn =
      cursor &&
      this.#db
        .selectFrom("Post") //
        .where("id", "=", cursor)
        .select(orderColumn);

    const page = await this.#db
      .selectFrom("Post")
      .$if(cursorOrderColumn != null, (qb) =>
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

    return page as Post[];
  };

  count = async () => {
    const result = await this.#db
      .selectFrom("Post")
      .select(({ fn }) => fn.countAll<number>().as("count"))
      .executeTakeFirstOrThrow();

    return result.count;
  };

  create = async (data: PostNew, trx?: Transaction<DB>) => {
    const { id, date } = PostId.genWithDate();

    try {
      const post = await (trx ?? this.#db)
        .insertInto("Post")
        .values({ id, updatedAt: date, ...data })
        .returningAll()
        .executeTakeFirstOrThrow();

      return { type: "Success", post: post as Post } as const;
    } catch (e) {
      if (isPgError(e)) {
        if (e.code === PgErrorCode.ForeignKeyViolation) {
          if (e.constraint?.includes("parentId")) {
            return { type: "PostNotExists" } as const;
          }
        }
      }

      return {
        type: "Unknown",
        e: e instanceof Error ? e : new Error("unknown", { cause: e }),
      } as const;
    }
  };

  update = async ({ id, authorId, parentId }: PostKey, data: PostUpd, trx?: Transaction<DB>) => {
    const post = await (trx ?? this.#db)
      .updateTable("Post")
      .where("id", "=", id)
      .$if(authorId != null, (qb) => qb.where("authorId", "=", authorId!))
      .$if(parentId != null, (qb) => qb.where("parentId", "=", parentId!))
      .where("status", "=", "Active")
      .set({ updatedAt: new Date(), ...data })
      .returningAll()
      .executeTakeFirst();

    return post as Post | undefined;
  };

  delete = async ({ id, authorId, parentId }: PostKey, trx?: Transaction<DB>) => {
    const post = await (trx ?? this.#db)
      .updateTable("Post")
      .where("id", "=", id)
      .$if(authorId != null, (qb) => qb.where("authorId", "=", authorId!))
      .$if(parentId != null, (qb) => qb.where("parentId", "=", parentId!))
      .where("status", "=", "Active")
      .set({ updatedAt: new Date(), content: "", status: PostStatus.Deleted })
      .returningAll()
      .executeTakeFirst();

    return post as Post | undefined;
  };

  loadTheir = async (key: userPostLoader.Key) => {
    return await this.#loaders.userPost.load(key);
  };

  loadTheirPage = async (key: userPostsLoader.Key) => {
    return await this.#loaders.userPosts.load(key);
  };

  loadTheirCount = async (key: userPostCountLoader.Key) => {
    return await this.#loaders.userPostCount.load(key);
  };

  loadTheirFavPage = async (key: userFavsLoader.Key) => {
    return await this.#loaders.userFavs.load(key);
  };

  loadTheirFavCount = async (key: userFavCountLoader.Key) => {
    return await this.#loaders.userFavCount.load(key);
  };

  loadReplyPage = async (key: repliesLoader.Key) => {
    return await this.#loaders.replies.load(key);
  };

  loadReplyCount = async (key: replyCountLoader.Key) => {
    return await this.#loaders.replyCount.load(key);
  };
}
