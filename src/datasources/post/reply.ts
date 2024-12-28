import type { Kysely } from "kysely";

import type { DB } from "../../db/generated/types.ts";
import type { Post } from "../../db/models/post.ts";
import * as postRepliesLoader from "./reply/loader/postReplies.ts";
import * as postReplyCountLoader from "./reply/loader/postReplyCount.ts";

export class PostReplyAPI {
  #db;
  #loaders;

  constructor(db: Kysely<DB>) {
    this.#db = db;
    this.#loaders = {
      replyCount: postReplyCountLoader.init(db),
      replyPage: postRepliesLoader.initClosure(db),
    };
  }

  loadPage = async (id: Post["id"], params: postRepliesLoader.Params) => {
    return await this.#loaders.replyPage(params).load(id);
  };

  loadCount = async (id: Post["id"]) => {
    return await this.#loaders.replyCount.load(id);
  };
}
