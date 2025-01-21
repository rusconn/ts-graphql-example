import type { Kysely } from "kysely";

import type { DB } from "../db/types.ts";
import { PgErrorCode, isPgError } from "../lib/pg/error.ts";
import type { Follow, FollowKey, FollowNew } from "../models/follow.ts";
import * as followLoader from "./loaders/follow.ts";

export class FollowAPI {
  #db;
  #loaders;

  constructor(db: Kysely<DB>) {
    this.#db = db;
    this.#loaders = {
      follow: followLoader.init(db),
    };
  }

  get = async ({ followerId, followeeId }: FollowKey) => {
    const follow = await this.#db
      .selectFrom("Follow")
      .where("followerId", "=", followerId)
      .where("followeeId", "=", followeeId)
      .selectAll()
      .executeTakeFirst();

    return follow as Follow | undefined;
  };

  create = async ({ followerId, followeeId }: FollowNew) => {
    try {
      const follow = await this.#db
        .insertInto("Follow")
        .values({ createdAt: new Date(), followerId, followeeId })
        .returningAll()
        .executeTakeFirstOrThrow();

      return { type: "Success", follow: follow as Follow } as const;
    } catch (e) {
      if (isPgError(e)) {
        if (e.code === PgErrorCode.UniqueViolation) {
          return { type: "FollowAlreadyExists" } as const;
        }
        if (e.code === PgErrorCode.ForeignKeyViolation) {
          if (e.constraint?.includes("followeeId")) {
            return { type: "FolloweeNotExists" } as const;
          }
        }
      }

      return {
        type: "Unknown",
        e: e instanceof Error ? e : new Error("unknown", { cause: e }),
      } as const;
    }
  };

  delete = async ({ followerId, followeeId }: FollowKey) => {
    const follow = await this.#db
      .deleteFrom("Follow")
      .where("followerId", "=", followerId)
      .where("followeeId", "=", followeeId)
      .returningAll()
      .executeTakeFirst();

    return follow as Follow | undefined;
  };

  load = async (key: followLoader.Key) => {
    return this.#loaders.follow.load(key);
  };
}
