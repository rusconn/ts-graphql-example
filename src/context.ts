import type { YogaInitialContext } from "graphql-yoga";
import type { OverrideProperties } from "type-fest";
import type { HttpRequest, HttpResponse } from "uWebSockets.js";

import type { TodoAPI } from "./datasources/todo.ts";
import type { UserAPI } from "./datasources/user.ts";
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
  api: {
    todo: TodoAPI;
    user: UserAPI;
  };
};

type Admin = OverrideProperties<Users, { role: "ADMIN" }>;
type User = OverrideProperties<Users, { role: "USER" }>;
type Guest = null;

type Users = Exclude<Awaited<ReturnType<UserAPI["getByToken"]>>, undefined>;
