import type { Kysely, Transaction } from "kysely";

import type { DB } from "../../db/generated/types.ts";
import type { Like, NewLike } from "../../db/models/like.ts";
import * as likeId from "../../db/models/like/id.ts";
import type { Post } from "../../db/models/post.ts";
import type { User } from "../../db/models/user.ts";

export class UserLikeAPI {
  #db;

  constructor(db: Kysely<DB>) {
    this.#db = db;
  }

  // TODO: dataloaderを使う
  load = async (key: {
    userId: Like["userId"];
    postId: Like["postId"];
  }) => {
    const like = await this.#db
      .selectFrom("Like")
      .where("userId", "=", key.userId)
      .where("postId", "=", key.postId)
      .selectAll()
      .executeTakeFirst();

    return like as Like | undefined;
  };

  // TODO: dataloaderを使う
  loadLikedPage = async (
    id: User["id"],
    {
      cursor,
      limit,
      reverse,
    }: {
      cursor?: Like["id"];
      limit: number;
      reverse: boolean;
    },
  ) => {
    const [direction, comp] = reverse //
      ? (["desc", "<"] as const)
      : (["asc", ">"] as const);

    const page = await this.#db
      .selectFrom("Like")
      .innerJoin("Post", "Like.postId", "Post.id")
      .where("Like.userId", "=", id)
      .$if(cursor != null, (qb) => qb.where(({ eb }) => eb("Like.id", comp, cursor!)))
      .selectAll("Post")
      .select("Like.id as lid")
      .orderBy("lid", direction)
      .limit(limit)
      .execute();

    return page as (Post & { lid: Like["id"] })[];
  };

  // TODO: dataloaderを使う
  loadCount = async (userId: Like["userId"]) => {
    const result = await this.#db
      .selectFrom("Like")
      .where("userId", "=", userId)
      .select(({ fn }) => fn.countAll().as("count"))
      .executeTakeFirstOrThrow();

    return Number(result.count);
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
