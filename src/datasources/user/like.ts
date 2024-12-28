import type { Kysely, Transaction } from "kysely";

import type { DB } from "../../db/generated/types.ts";
import type { Like, NewLike } from "../../db/models/like.ts";
import * as likeId from "../../db/models/like/id.ts";
import * as userLikeCountLoader from "./like/loader/userLikeCount.ts";
import * as userLikedsLoader from "./like/loader/userLikeds.ts";

export class UserLikeAPI {
  #db;
  #loaders;

  constructor(db: Kysely<DB>) {
    this.#db = db;
    this.#loaders = {
      likeCount: userLikeCountLoader.init(db),
      likedPage: userLikedsLoader.initClosure(db),
    };
  }

  loadLikedPage = async (key: userLikedsLoader.Key, params: userLikedsLoader.Params) => {
    return await this.#loaders.likedPage(params).load(key);
  };

  loadCount = async (key: userLikeCountLoader.Key) => {
    return await this.#loaders.likeCount.load(key);
  };

  create = async (
    key: {
      userId: NewLike["userId"];
      postId: NewLike["postId"];
    },
    trx?: Transaction<DB>,
  ) => {
    const id = likeId.gen();

    const like = await (trx ?? this.#db)
      .insertInto("Like")
      .values({
        id,
        userId: key.userId,
        postId: key.postId,
      })
      .onConflict((oc) => oc.doNothing())
      .returningAll()
      .executeTakeFirst();

    return like as Like | undefined;
  };

  delete = async (
    key: {
      userId: Like["userId"];
      postId: Like["postId"];
    },
    trx?: Transaction<DB>,
  ) => {
    const like = await (trx ?? this.#db)
      .deleteFrom("Like")
      .where("userId", "=", key.userId)
      .where("postId", "=", key.postId)
      .returningAll()
      .executeTakeFirst();

    return like as Like | undefined;
  };
}
