import type { Kysely } from "kysely";

import type { DB } from "../../db/generated/types.ts";
import type { Like } from "../../db/models/like.ts";
import type { Post } from "../../db/models/post.ts";
import * as postLikeLoader from "./like/loader.ts";
import * as postLikeCountLoader from "./like/loader/postLikeCount.ts";
import * as postLikersLoader from "./like/loader/postLikers.ts";

export class PostLikeAPI {
  #db;
  #loaders;

  constructor(db: Kysely<DB>) {
    this.#db = db;
    this.#loaders = {
      like: postLikeLoader.init(db),
      likeCount: postLikeCountLoader.init(db),
      likers: postLikersLoader.initClosure(db),
    };
  }

  load = async (key: postLikeLoader.Key) => {
    return await this.#loaders.like.load(key);
  };

  loadLikerPage = async (
    id: Post["id"],
    params: {
      cursor?: Like["id"];
      limit: number;
      reverse: boolean;
    },
  ) => {
    return await this.#loaders.likers(params).load(id);
  };

  loadCount = async (id: postLikeCountLoader.Key) => {
    return await this.#loaders.likeCount.load(id);
  };
}
