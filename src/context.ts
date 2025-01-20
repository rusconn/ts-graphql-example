import type { YogaInitialContext } from "graphql-yoga";
import type { HttpRequest, HttpResponse } from "uWebSockets.js";

import type { UserAPI } from "./datasources/user.ts";
import type { UserTodoAPI } from "./datasources/userTodo.ts";
import type { client } from "./db/client.ts";
import type { User as UserModel } from "./db/models/user.ts";
import type { logger } from "./logger.ts";

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
  user: Admin | User | Guest;
  db: typeof client;
  api: {
    user: UserAPI;
    userTodo: UserTodoAPI;
  };
};

type Admin = UserModel & { role: "ADMIN" };
type User = UserModel & { role: "USER" };
type Guest = null;
