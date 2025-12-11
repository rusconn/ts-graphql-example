import type { YogaInitialContext } from "graphql-yoga";
import type { HttpRequest, HttpResponse } from "uWebSockets.js";

import type { client } from "./db/client.ts";
import type * as Domain from "./domain/user.ts";
import type { logger } from "./logger.ts";
import type { TodoRepo } from "./repositories/todo.ts";
import type { UserRepo } from "./repositories/user.ts";

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
  repos: {
    todo: TodoRepo;
    user: UserRepo;
  };
};

type Admin = Pick<Domain.User, "id"> & { role: "ADMIN" };
type User = Pick<Domain.User, "id"> & { role: "USER" };
type Guest = null;
