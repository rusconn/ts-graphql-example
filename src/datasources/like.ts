import type { Kysely } from "kysely";

import type { DB } from "../db/types.ts";
import { PgErrorCode, isPgError } from "../lib/pg/error.ts";
import type { Like, LikeKey, LikeNew } from "../models/like.ts";
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

  get = async ({ userId, postId }: LikeKey) => {
    const like = await this.#db
      .selectFrom("Like")
      .where("userId", "=", userId)
      .where("postId", "=", postId)
      .selectAll()
      .executeTakeFirst();

    return like as Like | undefined;
  };

  create = async ({ userId, postId }: LikeNew) => {
    try {
      const like = await this.#db
        .insertInto("Like")
        .values({ createdAt: new Date(), userId, postId })
        .returningAll()
        .executeTakeFirstOrThrow();

      return { type: "Success", like: like as Like } as const;
    } catch (e) {
      if (isPgError(e)) {
        if (e.code === PgErrorCode.UniqueViolation) {
          return { type: "LikeAlreadyExists" } as const;
        }
        if (e.code === PgErrorCode.ForeignKeyViolation) {
          if (e.constraint?.includes("postId")) {
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

  delete = async ({ userId, postId }: LikeKey) => {
    const like = await this.#db
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
