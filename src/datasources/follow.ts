import type { Kysely, Transaction } from "kysely";

import type { DB } from "../db/generated/types.ts";
import type { Follow, FollowKey } from "../db/models/follow.ts";
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

  create = async ({ followerId, followeeId }: FollowKey, trx?: Transaction<DB>) => {
    const follow = await (trx ?? this.#db)
      .insertInto("Follow")
      .values({
        createdAt: new Date(),
        followerId,
        followeeId,
      })
      .onConflict((oc) => oc.doNothing())
      .returningAll()
      .executeTakeFirst();

    return follow as Follow | undefined;
  };

  delete = async ({ followerId, followeeId }: FollowKey, trx?: Transaction<DB>) => {
    const follow = await (trx ?? this.#db)
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
