import type { YogaInitialContext } from "graphql-yoga";
import type { OverrideProperties } from "type-fest";
import type { HttpRequest, HttpResponse } from "uWebSockets.js";

import type { client } from "./db/client.ts";
import type { User } from "./db/types.ts";
import type { logger } from "./logger.ts";
import type { TodoQueryForAdmin } from "./query-services/todo/for-admin.ts";
import type { TodoQueryForUser } from "./query-services/todo/for-user.ts";
import type { UserQueryForAdmin } from "./query-services/user/for-admin.ts";
import type { UserQueryForGuest } from "./query-services/user/for-guest.ts";
import type { UserQueryForUser } from "./query-services/user/for-user.ts";
import type { TodoRepoForAdmin } from "./repositories/todo/for-admin.ts";
import type { TodoRepoForUser } from "./repositories/todo/for-user.ts";
import type { UserRepoForAdmin } from "./repositories/user/for-admin.ts";
import type { UserRepoForGuest } from "./repositories/user/for-guest.ts";
import type { UserRepoForUser } from "./repositories/user/for-user.ts";
import type { UserTokenRepoForAdmin } from "./repositories/user-token/for-admin.ts";
import type { UserTokenRepoForGuest } from "./repositories/user-token/for-guest.ts";
import type { UserTokenRepoForUser } from "./repositories/user-token/for-user.ts";

export type Context = ServerContext & PluginContext & YogaInitialContext & UserContext;

export type ServerContext = {
  req: HttpRequest;
  res: HttpResponse;
};

export type PluginContext = {
  requestId?: string;
};

export type UserContext = ContextForAuthed | ContextForGuest;

export type ContextForAuthed = ContextForAdmin | ContextForUser;

type ContextForAdmin = ContextBase & {
  role: "admin";
  user: OverrideProperties<User, { role: "admin" }>;
  queries: {
    todo: TodoQueryForAdmin;
    user: UserQueryForAdmin;
  };
  repos: {
    todo: TodoRepoForAdmin;
    user: UserRepoForAdmin;
    userToken: UserTokenRepoForAdmin;
  };
};

type ContextForUser = ContextBase & {
  role: "user";
  user: OverrideProperties<User, { role: "user" }>;
  queries: {
    todo: TodoQueryForUser;
    user: UserQueryForUser;
  };
  repos: {
    todo: TodoRepoForUser;
    user: UserRepoForUser;
    userToken: UserTokenRepoForUser;
  };
};

type ContextForGuest = ContextBase & {
  role: "guest";
  user: null;
  queries: {
    user: UserQueryForGuest;
  };
  repos: {
    user: UserRepoForGuest;
    userToken: UserTokenRepoForGuest;
  };
};

export type ContextBase = {
  start: ReturnType<typeof Date.now>;
  logger: ReturnType<typeof logger.child>;
  db: typeof client;
};
