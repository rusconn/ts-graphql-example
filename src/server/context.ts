import type { YogaInitialContext } from "graphql-yoga";
import type { OverrideProperties } from "type-fest";
import type { HttpRequest, HttpResponse } from "uWebSockets.js";

import type { kysely } from "../infra/datasources/db/client.ts";
import type * as Dto from "../graphql/_dto.ts";
import type { logger } from "./logger.ts";
import type { ITodoRepoForAdmin } from "../domain/repos/todo/for-admin.ts";
import type { IUserRepoForAdmin } from "../domain/repos/user/for-admin.ts";
import type { IRefreshTokenRepoForAdmin } from "../domain/repos/refresh-token/for-admin.ts";
import type { ITodoRepoForUser } from "../domain/repos/todo/for-user.ts";
import type { IUserRepoForUser } from "../domain/repos/user/for-user.ts";
import type { IRefreshTokenRepoForUser } from "../domain/repos/refresh-token/for-user.ts";
import type { IUserRepoForGuest } from "../domain/repos/user/for-guest.ts";
import type { IRefreshTokenRepoForGuest } from "../domain/repos/refresh-token/for-guest.ts";
import type { IUserQueryForGuest } from "../graphql/_queries/user/for-guest.ts";
import type { ICredentialQueryForGuest } from "../graphql/_queries/credential/for-guest.ts";
import type { ITodoQueryForUser } from "../graphql/_queries/todo/for-user.ts";
import type { IUserQueryForUser } from "../graphql/_queries/user/for-user.ts";
import type { ICredentialQueryForUser } from "../graphql/_queries/credential/for-user.ts";
import type { IUserQueryForAdmin } from "../graphql/_queries/user/for-admin.ts";
import type { ITodoQueryForAdmin } from "../graphql/_queries/todo/for-admin.ts";
import type { ICredentialQueryForAdmin } from "../graphql/_queries/credential/for-admin.ts";

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
  role: "ADMIN";
  user: OverrideProperties<Dto.User.Type, { role: "ADMIN" }>;
  queries: {
    credential: ICredentialQueryForAdmin;
    todo: ITodoQueryForAdmin;
    user: IUserQueryForAdmin;
  };
  repos: {
    todo: ITodoRepoForAdmin;
    user: IUserRepoForAdmin;
    refreshToken: IRefreshTokenRepoForAdmin;
  };
};

type ContextForUser = ContextBase & {
  role: "USER";
  user: OverrideProperties<Dto.User.Type, { role: "USER" }>;
  queries: {
    credential: ICredentialQueryForUser;
    todo: ITodoQueryForUser;
    user: IUserQueryForUser;
  };
  repos: {
    todo: ITodoRepoForUser;
    user: IUserRepoForUser;
    refreshToken: IRefreshTokenRepoForUser;
  };
};

type ContextForGuest = ContextBase & {
  role: "GUEST";
  user: null;
  queries: {
    credential: ICredentialQueryForGuest;
    user: IUserQueryForGuest;
  };
  repos: {
    user: IUserRepoForGuest;
    refreshToken: IRefreshTokenRepoForGuest;
  };
};

export type ContextBase = {
  start: ReturnType<typeof Date.now>;
  logger: ReturnType<typeof logger.child>;
  kysely: typeof kysely;
};
