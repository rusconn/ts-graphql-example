import type { YogaInitialContext } from "graphql-yoga";
import type { HttpRequest, HttpResponse } from "uWebSockets.js";

import type { client } from "./db/client.ts";
import type { User } from "./db/types.ts";
import type { logger } from "./logger.ts";
import type { TodoQuery } from "./query-services/todo.ts";
import type { UserQuery } from "./query-services/user.ts";
import type { TodoRepo } from "./repositories/todo.ts";
import type { UserRepo } from "./repositories/user.ts";
import type { UserTokenRepo } from "./repositories/user-token.ts";

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
  user: User | null;
  db: typeof client;
  queries: {
    todo: TodoQuery;
    user: UserQuery;
  };
  repos: {
    todo: TodoRepo;
    user: UserRepo;
    userToken: UserTokenRepo;
  };
};
