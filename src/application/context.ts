import type { Kysely } from "kysely";
import type { ReadonlyKysely } from "kysely/readonly";
import type { OverrideProperties } from "type-fest";

import type { IRefreshTokenReaderRepo } from "../domain/repositories-read/refresh-token/shared.ts";
import type { ITodoReaderRepoForAdmin } from "../domain/repositories-read/todo/for-admin.ts";
import type { ITodoReaderRepoForUser } from "../domain/repositories-read/todo/for-user.ts";
import type { IUserReaderRepoForAdmin } from "../domain/repositories-read/user/for-admin.ts";
import type { IUserReaderRepoForGuest } from "../domain/repositories-read/user/for-guest.ts";
import type { IUserReaderRepoForUser } from "../domain/repositories-read/user/for-user.ts";
import type { DB } from "../infrastructure/datasources/db/types.ts";
import type { pino } from "../infrastructure/loggers/pino.ts";
import { TodoQueryForAdmin } from "../infrastructure/queries/todo/for-admin.ts";
import { TodoQueryForUser } from "../infrastructure/queries/todo/for-user.ts";
import { UserQueryForAdmin } from "../infrastructure/queries/user/for-admin.ts";
import { UserQueryForUser } from "../infrastructure/queries/user/for-user.ts";
import { RefreshTokenReaderRepo } from "../infrastructure/repositories-read/refresh-token/shared.ts";
import { TodoReaderRepoForAdmin } from "../infrastructure/repositories-read/todo/for-admin.ts";
import { TodoReaderRepoForUser } from "../infrastructure/repositories-read/todo/for-user.ts";
import { UserReaderRepoForAdmin } from "../infrastructure/repositories-read/user/for-admin.ts";
import { UserReaderRepoForGuest } from "../infrastructure/repositories-read/user/for-guest.ts";
import { UserReaderRepoForUser } from "../infrastructure/repositories-read/user/for-user.ts";
import { UnitOfWorkForAdmin } from "../infrastructure/unit-of-works/for-admin.ts";
import { UnitOfWorkForGuest } from "../infrastructure/unit-of-works/for-guest.ts";
import { UnitOfWorkForUser } from "../infrastructure/unit-of-works/for-user.ts";
import * as Dto from "./dto.ts";
import type { ITodoQueryForAdmin } from "./queries/todo/for-admin.ts";
import type { ITodoQueryForUser } from "./queries/todo/for-user.ts";
import type { IUserQueryForAdmin } from "./queries/user/for-admin.ts";
import type { IUserQueryForUser } from "./queries/user/for-user.ts";
import type { IUnitOfWorkForAdmin } from "./unit-of-works/for-admin.ts";
import type { IUnitOfWorkForGuest } from "./unit-of-works/for-guest.ts";
import type { IUnitOfWorkForUser } from "./unit-of-works/for-user.ts";

export type AppContext = AppContextForAdmin | AppContextForUser | AppContextForGuest;
export type AppContextForAuthed = AppContextForAdmin | AppContextForUser;

export type AppContextForAdmin = {
  role: "ADMIN";
  user: OverrideProperties<Dto.User.Type, { role: "ADMIN" }>;
  queries: {
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
  repos: {
    refreshToken: IRefreshTokenReaderRepo;
    user: IUserReaderRepoForGuest;
  };
  unitOfWork: IUnitOfWorkForGuest;
  logger: typeof pino;
};

export async function findAppContextUser(id: Dto.User.Type["id"], kysely: Kysely<DB>) {
  const user = await kysely
    .selectFrom("users") //
    .where("id", "=", id)
    .selectAll()
    .executeTakeFirst();

  return user && Dto.User.parseOrThrow(user);
}

export function createAppContext(input: {
  user: AppContext["user"];
  logger: AppContext["logger"];
  kysely: Kysely<DB>;
}): AppContext {
  const { user, logger, kysely } = input;
  const kyselyReadonly = kysely as unknown as ReadonlyKysely<DB>;

  switch (user?.role) {
    case "ADMIN":
      return {
        role: user.role,
        user,
        queries: {
          todo: new TodoQueryForAdmin(kyselyReadonly, user.id),
          user: new UserQueryForAdmin(kyselyReadonly),
        },
        repos: {
          refreshToken: new RefreshTokenReaderRepo(kyselyReadonly),
          todo: new TodoReaderRepoForAdmin(kyselyReadonly, user.id),
          user: new UserReaderRepoForAdmin(kyselyReadonly, user.id),
        },
        unitOfWork: new UnitOfWorkForAdmin(kysely, user.id),
        logger,
      };
    case "USER":
      return {
        role: user.role,
        user,
        queries: {
          todo: new TodoQueryForUser(kyselyReadonly, user.id),
          user: new UserQueryForUser(kyselyReadonly, user.id),
        },
        repos: {
          refreshToken: new RefreshTokenReaderRepo(kyselyReadonly),
          todo: new TodoReaderRepoForUser(kyselyReadonly, user.id),
          user: new UserReaderRepoForUser(kyselyReadonly, user.id),
        },
        unitOfWork: new UnitOfWorkForUser(kysely, user.id),
        logger,
      };
    case undefined:
      return {
        role: "GUEST",
        user,
        repos: {
          refreshToken: new RefreshTokenReaderRepo(kyselyReadonly),
          user: new UserReaderRepoForGuest(kyselyReadonly),
        },
        unitOfWork: new UnitOfWorkForGuest(kysely),
        logger,
      };
    default:
      throw new Error(user satisfies never);
  }
}
