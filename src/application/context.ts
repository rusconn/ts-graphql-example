import type { Kysely } from "kysely";
import type { OverrideProperties } from "type-fest";

import type { ITodoReaderRepoForAdmin } from "../domain/repos-for-read/for-admin/todo.ts";
import type { IUserReaderRepoForAdmin } from "../domain/repos-for-read/for-admin/user.ts";
import type { ITodoReaderRepoForUser } from "../domain/repos-for-read/for-user/todo.ts";
import type { IUserReaderRepoForUser } from "../domain/repos-for-read/for-user/user.ts";
import type { IRefreshTokenReaderRepo } from "../domain/repos-for-read/refresh-token.ts";
import type { IUnitOfWorkForAdmin } from "../domain/unit-of-works/for-admin.ts";
import type { IUnitOfWorkForGuest } from "../domain/unit-of-works/for-guest.ts";
import type { IUnitOfWorkForUser } from "../domain/unit-of-works/for-user.ts";
import type { DB } from "../infrastructure/datasources/_shared/types.ts";
import type { pino } from "../infrastructure/loggers/pino.ts";
import { CredentialQueryForAdmin } from "../infrastructure/queries/db/credential/for-admin.ts";
import { CredentialQueryForGuest } from "../infrastructure/queries/db/credential/for-guest.ts";
import { CredentialQueryForUser } from "../infrastructure/queries/db/credential/for-user.ts";
import { TodoQueryForAdmin } from "../infrastructure/queries/db/todo/for-admin.ts";
import { TodoQueryForUser } from "../infrastructure/queries/db/todo/for-user.ts";
import { UserQueryForAdmin } from "../infrastructure/queries/db/user/for-admin.ts";
import { UserQueryForUser } from "../infrastructure/queries/db/user/for-user.ts";
import { TodoReaderRepoForAdmin } from "../infrastructure/repos-for-read/db/for-admin/todo.ts";
import { UserReaderRepoForAdmin } from "../infrastructure/repos-for-read/db/for-admin/user.ts";
import { TodoReaderRepoForUser } from "../infrastructure/repos-for-read/db/for-user/todo.ts";
import { UserReaderRepoForUser } from "../infrastructure/repos-for-read/db/for-user/user.ts";
import { RefreshTokenReaderRepo } from "../infrastructure/repos-for-read/db/refresh-token.ts";
import { UnitOfWorkForAdmin } from "../infrastructure/unit-of-works/db/for-admin.ts";
import { UnitOfWorkForGuest } from "../infrastructure/unit-of-works/db/for-guest.ts";
import { UnitOfWorkForUser } from "../infrastructure/unit-of-works/db/for-user.ts";
import * as Dto from "./dto.ts";
import type { ICredentialQueryForAdmin } from "./queries/credential/for-admin.ts";
import type { ICredentialQueryForGuest } from "./queries/credential/for-guest.ts";
import type { ICredentialQueryForUser } from "./queries/credential/for-user.ts";
import type { ITodoQueryForAdmin } from "./queries/todo/for-admin.ts";
import type { ITodoQueryForUser } from "./queries/todo/for-user.ts";
import type { IUserQueryForAdmin } from "./queries/user/for-admin.ts";
import type { IUserQueryForUser } from "./queries/user/for-user.ts";

export type AppContext = AppContextForAdmin | AppContextForUser | AppContextForGuest;
export type AppContextForAuthed = AppContextForAdmin | AppContextForUser;

export type AppContextForAdmin = {
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
  logger: typeof pino;
};

export type AppContextForUser = {
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
  logger: typeof pino;
};

export type AppContextForGuest = {
  role: "GUEST";
  user: null;
  queries: {
    credential: ICredentialQueryForGuest;
  };
  repos: {
    refreshToken: IRefreshTokenReaderRepo;
  };
  unitOfWork: IUnitOfWorkForGuest;
  logger: typeof pino;
};

export const findAppContextUser = async (id: Dto.User.Type["id"], kysely: Kysely<DB>) => {
  const user = await kysely
    .selectFrom("users") //
    .where("id", "=", id)
    .selectAll()
    .executeTakeFirst();

  return user && Dto.User.parseOrThrow(user);
};

export const createAppContext = (input: {
  user: AppContext["user"];
  logger: AppContext["logger"];
  kysely: Kysely<DB>;
}): AppContext => {
  const { user, logger, kysely } = input;
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
        logger,
      };
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
        logger,
      };
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
        logger,
      };
    default:
      throw new Error(user satisfies never);
  }
};
