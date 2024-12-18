import type { Kysely } from "kysely";

import type { DB } from "../types.ts";
import * as post from "./post.ts";
import * as user from "./user.ts";
import * as userPosts from "./userPosts.ts";
import * as userPostsCount from "./userPostsCount.ts";

export const createLoaders = (db: Kysely<DB>) => ({
  post: post.init(db),
  user: user.init(db),
  userPosts: userPosts.initClosure(db),
  userPostsCount: userPostsCount.initClosure(db),
});

export type { Key as PostKey } from "./post.ts";
export type { Key as UserKey } from "./user.ts";
