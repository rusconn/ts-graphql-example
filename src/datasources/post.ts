import type { Kysely, Transaction } from "kysely";

import type { DB } from "../db/generated/types.ts";
import type { Post } from "../db/models/post.ts";
import { PostLikeAPI } from "./post/like.ts";
import { PostReplyAPI } from "./post/reply.ts";

export class PostAPI {
  #db;

  loadLike;
  loadLikerPage;
  loadLikeCount;

  loadReplyPage;
  loadReplyCount;

  constructor(db: Kysely<DB>) {
    this.#db = db;

    const likeAPI = new PostLikeAPI(db);
    this.loadLike = likeAPI.load;
    this.loadLikerPage = likeAPI.loadLikerPage;
    this.loadLikeCount = likeAPI.loadCount;

    const replyAPI = new PostReplyAPI(db);
    this.loadReplyPage = replyAPI.loadPage;
    this.loadReplyCount = replyAPI.loadCount;
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

  gets = async ({
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

    return page as Post[];
  };

  count = async () => {
    const result = await this.#db
      .selectFrom("Post")
      .select(({ fn }) => fn.countAll().as("count"))
      .executeTakeFirstOrThrow();

    return Number(result.count);
  };
}
