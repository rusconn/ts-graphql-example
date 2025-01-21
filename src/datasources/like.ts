import type { Kysely, Transaction } from "kysely";

import type { DB } from "../db/generated/types.ts";
import type { Like, LikeKey } from "../db/models/like.ts";
import * as likeLoader from "./loaders/like.ts";
import * as postLikeCountLoader from "./loaders/postLikeCount.ts";

export class LikeAPI {
  #db;
  #loaders;

  constructor(db: Kysely<DB>) {
    this.#db = db;
    this.#loaders = {
      like: likeLoader.init(db),
      postLikeCount: postLikeCountLoader.init(db),
    };
  }

  create = async ({ userId, postId }: LikeKey, trx?: Transaction<DB>) => {
    const like = await (trx ?? this.#db)
      .insertInto("Like")
      .values({
        createdAt: new Date(),
        userId,
        postId,
      })
      .onConflict((oc) => oc.doNothing())
      .returningAll()
      .executeTakeFirst();

    return like as Like | undefined;
  };

  delete = async ({ userId, postId }: LikeKey, trx?: Transaction<DB>) => {
    const like = await (trx ?? this.#db)
      .deleteFrom("Like")
      .where("userId", "=", userId)
      .where("postId", "=", postId)
      .returningAll()
      .executeTakeFirst();

    return like as Like | undefined;
  };

  load = async (key: likeLoader.Key) => {
    return await this.#loaders.like.load(key);
  };

  loadCountByPostId = async (key: postLikeCountLoader.Key) => {
    return await this.#loaders.postLikeCount.load(key);
  };
}
