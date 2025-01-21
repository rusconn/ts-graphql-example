import type { YogaInitialContext } from "graphql-yoga";
import type { HttpRequest, HttpResponse } from "uWebSockets.js";

import type { BlockAPI } from "./datasources/block.ts";
import type { FollowAPI } from "./datasources/follow.ts";
import type { LikeAPI } from "./datasources/like.ts";
import type { PostAPI } from "./datasources/post.ts";
import type { UserAPI } from "./datasources/user.ts";
import type { client } from "./db/client.ts";
import type { logger } from "./logger.ts";
import type { User as UserModel } from "./models/user.ts";

export type Context = ServerContext & PluginContext & YogaInitialContext & UserContext;

export type ServerContext = {
  req: HttpRequest;
  res: HttpResponse;
};

export type PluginContext = {
  requestId?: string;
};

export type UserContext = {
  start: ReturnType<typeof Date.now>;
  logger: ReturnType<typeof logger.child>;
  user: User | Guest;
  db: typeof client;
  api: {
    block: BlockAPI;
    follow: FollowAPI;
    like: LikeAPI;
    post: PostAPI;
    user: UserAPI;
  };
};

type User = UserModel;
type Guest = null;
