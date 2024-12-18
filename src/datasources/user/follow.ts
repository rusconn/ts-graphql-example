import type { Kysely, Transaction } from "kysely";

import type { DB } from "../../db/generated/types.ts";
import type { Follow, NewFollow } from "../../db/models/follow.ts";
import * as followId from "../../db/models/follow/id.ts";

export class UserFollowAPI {
  #db;

  constructor(db: Kysely<DB>) {
    this.#db = db;
  }

  // TODO: dataloaderを使う
  load = async (key: {
    followerId: Follow["followerId"];
    followeeId: Follow["followeeId"];
  }) => {
    const follow = await this.#db
      .selectFrom("Follow")
      .where("followerId", "=", key.followerId)
      .where("followeeId", "=", key.followeeId)
      .selectAll()
      .executeTakeFirst();

    return follow as Follow | undefined;
  };

  // TODO: dataloaderを使う
  loadFollowerCount = async (followeeId: Follow["followeeId"]) => {
    const result = await this.#db
      .selectFrom("Follow")
      .where("followeeId", "=", followeeId)
      .select(({ fn }) => fn.countAll().as("count"))
      .executeTakeFirstOrThrow();

    return Number(result.count);
  };

  // TODO: dataloaderを使う
  loadFolloweeCount = async (followerId: Follow["followerId"]) => {
    const result = await this.#db
      .selectFrom("Follow")
      .where("followerId", "=", followerId)
      .select(({ fn }) => fn.countAll().as("count"))
      .executeTakeFirstOrThrow();

    return Number(result.count);
  };

  create = async (
    key: {
      followerId: NewFollow["followerId"];
      followeeId: NewFollow["followeeId"];
    },
    trx?: Transaction<DB>,
  ) => {
    const id = followId.gen();

    const follow = await (trx ?? this.#db)
      .insertInto("Follow")
      .values({
        id,
        followerId: key.followerId,
        followeeId: key.followeeId,
      })
      .onConflict((oc) => oc.doNothing())
      .returningAll()
      .executeTakeFirst();

    return follow as Follow | undefined;
  };

  delete = async (
    key: {
      followerId: Follow["followerId"];
      followeeId: Follow["followeeId"];
    },
    trx?: Transaction<DB>,
  ) => {
    const follow = await (trx ?? this.#db)
      .deleteFrom("Follow")
      .where("followerId", "=", key.followerId)
      .where("followeeId", "=", key.followeeId)
      .returningAll()
      .executeTakeFirst();

    return follow as Follow | undefined;
  };
}
