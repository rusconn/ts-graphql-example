import type { YogaInitialContext } from "graphql-yoga";
import type { OverrideProperties } from "type-fest";
import type { HttpRequest, HttpResponse } from "uWebSockets.js";

import type { ITodoReaderRepoForAdmin } from "../domain/repos-for-read/for-admin/todo.ts";
import type { IUserReaderRepoForAdmin } from "../domain/repos-for-read/for-admin/user.ts";
import type { ITodoReaderRepoForUser } from "../domain/repos-for-read/for-user/todo.ts";
import type { IUserReaderRepoForUser } from "../domain/repos-for-read/for-user/user.ts";
import type { IUnitOfWorkForAdmin } from "../domain/unit-of-works/for-admin.ts";
import type { IUnitOfWorkForGuest } from "../domain/unit-of-works/for-guest.ts";
import type { IUnitOfWorkForUser } from "../domain/unit-of-works/for-user.ts";
import type * as Dto from "../graphql/_dto.ts";
import type { ICredentialQueryForAdmin } from "../graphql/_queries/credential/for-admin.ts";
import type { ICredentialQueryForGuest } from "../graphql/_queries/credential/for-guest.ts";
import type { ICredentialQueryForUser } from "../graphql/_queries/credential/for-user.ts";
import type { ITodoQueryForAdmin } from "../graphql/_queries/todo/for-admin.ts";
import type { ITodoQueryForUser } from "../graphql/_queries/todo/for-user.ts";
import type { IUserQueryForAdmin } from "../graphql/_queries/user/for-admin.ts";
import type { IUserQueryForGuest } from "../graphql/_queries/user/for-guest.ts";
import type { IUserQueryForUser } from "../graphql/_queries/user/for-user.ts";
import type { logger } from "./logger.ts";

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
    todo: ITodoReaderRepoForAdmin;
    user: IUserReaderRepoForAdmin;
  };
  unitOfWork: IUnitOfWorkForAdmin;
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
    todo: ITodoReaderRepoForUser;
    user: IUserReaderRepoForUser;
  };
  unitOfWork: IUnitOfWorkForUser;
};

type ContextForGuest = ContextBase & {
  role: "GUEST";
  user: null;
  queries: {
    credential: ICredentialQueryForGuest;
    user: IUserQueryForGuest;
  };
  unitOfWork: IUnitOfWorkForGuest;
};

export type ContextBase = {
  start: ReturnType<typeof Date.now>;
  logger: ReturnType<typeof logger.child>;
};
