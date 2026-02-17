import type { YogaInitialContext } from "graphql-yoga";
import type { Kysely } from "kysely";
import type { OverrideProperties } from "type-fest";
import type { HttpRequest, HttpResponse } from "uWebSockets.js";

import type { ICredentialQueryForAdmin } from "../application/queries/credential/for-admin.ts";
import type { ICredentialQueryForGuest } from "../application/queries/credential/for-guest.ts";
import type { ICredentialQueryForUser } from "../application/queries/credential/for-user.ts";
import * as Dto from "../application/queries/dto.ts";
import type { ITodoQueryForAdmin } from "../application/queries/todo/for-admin.ts";
import type { ITodoQueryForUser } from "../application/queries/todo/for-user.ts";
import type { IUserQueryForAdmin } from "../application/queries/user/for-admin.ts";
import type { IUserQueryForUser } from "../application/queries/user/for-user.ts";
import type { ITodoReaderRepoForAdmin } from "../domain/repos-for-read/for-admin/todo.ts";
import type { IUserReaderRepoForAdmin } from "../domain/repos-for-read/for-admin/user.ts";
import type { ITodoReaderRepoForUser } from "../domain/repos-for-read/for-user/todo.ts";
import type { IUserReaderRepoForUser } from "../domain/repos-for-read/for-user/user.ts";
import type { IRefreshTokenReaderRepo } from "../domain/repos-for-read/refresh-token.ts";
import type { IUnitOfWorkForAdmin } from "../domain/unit-of-works/for-admin.ts";
import type { IUnitOfWorkForGuest } from "../domain/unit-of-works/for-guest.ts";
import type { IUnitOfWorkForUser } from "../domain/unit-of-works/for-user.ts";
import type { DB } from "../infra/datasources/_shared/generated.ts";
import { CredentialQueryForAdmin } from "../infra/queries/db/credential/for-admin.ts";
import { CredentialQueryForGuest } from "../infra/queries/db/credential/for-guest.ts";
import { CredentialQueryForUser } from "../infra/queries/db/credential/for-user.ts";
import { TodoQueryForAdmin } from "../infra/queries/db/todo/for-admin.ts";
import { TodoQueryForUser } from "../infra/queries/db/todo/for-user.ts";
import { UserQueryForAdmin } from "../infra/queries/db/user/for-admin.ts";
import { UserQueryForUser } from "../infra/queries/db/user/for-user.ts";
import { TodoReaderRepoForAdmin } from "../infra/repos-for-read/db/for-admin/todo.ts";
import { UserReaderRepoForAdmin } from "../infra/repos-for-read/db/for-admin/user.ts";
import { TodoReaderRepoForUser } from "../infra/repos-for-read/db/for-user/todo.ts";
import { UserReaderRepoForUser } from "../infra/repos-for-read/db/for-user/user.ts";
import { RefreshTokenReaderRepo } from "../infra/repos-for-read/db/refresh-token.ts";
import { UnitOfWorkForAdmin } from "../infra/unit-of-works/db/for-admin.ts";
import { UnitOfWorkForGuest } from "../infra/unit-of-works/db/for-guest.ts";
import { UnitOfWorkForUser } from "../infra/unit-of-works/db/for-user.ts";
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
    refreshToken: IRefreshTokenReaderRepo;
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
    refreshToken: IRefreshTokenReaderRepo;
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
  };
  repos: {
    refreshToken: IRefreshTokenReaderRepo;
  };
  unitOfWork: IUnitOfWorkForGuest;
};

export type ContextBase = {
  start: ReturnType<typeof Date.now>;
  logger: typeof logger;
};

export const createUserContextCore = (user: UserContext["user"], kysely: Kysely<DB>) => {
  switch (user?.role) {
    case "ADMIN":
      return {
        role: user.role,
        user,
        queries: {
          credential: new CredentialQueryForAdmin(kysely, user.id),
          todo: new TodoQueryForAdmin(kysely),
          user: new UserQueryForAdmin(kysely),
        },
        repos: {
          refreshToken: new RefreshTokenReaderRepo(kysely),
          todo: new TodoReaderRepoForAdmin(kysely, user.id),
          user: new UserReaderRepoForAdmin(kysely, user.id),
        },
        unitOfWork: new UnitOfWorkForAdmin(kysely, user.id),
      } as const;
    case "USER":
      return {
        role: user.role,
        user,
        queries: {
          credential: new CredentialQueryForUser(kysely, user.id),
          todo: new TodoQueryForUser(kysely, user.id),
          user: new UserQueryForUser(kysely, user.id),
        },
        repos: {
          refreshToken: new RefreshTokenReaderRepo(kysely),
          todo: new TodoReaderRepoForUser(kysely, user.id),
          user: new UserReaderRepoForUser(kysely, user.id),
        },
        unitOfWork: new UnitOfWorkForUser(kysely, user.id),
      } as const;
    case undefined:
      return {
        role: "GUEST",
        user,
        queries: {
          credential: new CredentialQueryForGuest(kysely),
        },
        repos: {
          refreshToken: new RefreshTokenReaderRepo(kysely),
        },
        unitOfWork: new UnitOfWorkForGuest(kysely),
      } as const;
    default:
      throw new Error(user satisfies never);
  }
};

export const findContextUser = async (id: Dto.User.Type["id"], kysely: Kysely<DB>) => {
  const user = await kysely
    .selectFrom("users") //
    .where("id", "=", id)
    .selectAll()
    .executeTakeFirst();

  return user && Dto.User.parseOrThrow(user);
};
