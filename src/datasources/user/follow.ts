import type { Kysely, Transaction } from "kysely";

import type { DB } from "../../db/generated/types.ts";
import type { Follow, NewFollow } from "../../db/models/follow.ts";
import * as followId from "../../db/models/follow/id.ts";
import * as userFollowLoader from "./follow/loader.ts";
import * as userFollowerCountLoader from "./follow/loader/userFollowerCount.ts";
import * as userFollowersLoader from "./follow/loader/userFollowers.ts";
import * as userFollowingCountLoader from "./follow/loader/userFollowingCount.ts";
import * as userFollowingsLoader from "./follow/loader/userFollowings.ts";

export class UserFollowAPI {
  #db;
  #loaders;

  constructor(db: Kysely<DB>) {
    this.#db = db;
    this.#loaders = {
      follow: userFollowLoader.init(db),
      followers: userFollowersLoader.initClosure(db),
      followerCount: userFollowerCountLoader.init(db),
      followings: userFollowingsLoader.initClosure(db),
      followingCount: userFollowingCountLoader.init(db),
    };
  }

  load = async (key: userFollowLoader.Key) => {
    return this.#loaders.follow.load(key);
  };

  loadFollowers = async (key: userFollowersLoader.Key, params: userFollowersLoader.Params) => {
    return await this.#loaders.followers(params).load(key);
  };

  loadFollowerCount = async (key: userFollowerCountLoader.Key) => {
    return await this.#loaders.followerCount.load(key);
  };

  loadFollowings = async (key: userFollowingsLoader.Key, params: userFollowingsLoader.Params) => {
    return await this.#loaders.followings(params).load(key);
  };

  loadFollowingCount = async (key: userFollowerCountLoader.Key) => {
    return await this.#loaders.followingCount.load(key);
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
