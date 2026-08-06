import type { Kysely } from "kysely";
import type { ReadonlyKysely } from "kysely/readonly";

import type { AppContext } from "../application/context.ts";
import * as Dto from "../application/dto.ts";
import type { DB } from "./datasources/db/types.ts";
import { TodoQueryForAdmin } from "./queries/todo/for-admin.ts";
import { TodoQueryForUser } from "./queries/todo/for-user.ts";
import { UserQueryForAdmin } from "./queries/user/for-admin.ts";
import { UserQueryForUser } from "./queries/user/for-user.ts";
import { RefreshTokenReaderRepo } from "./repositories-read/refresh-token/shared.ts";
import { TodoReaderRepoForAdmin } from "./repositories-read/todo/for-admin.ts";
import { TodoReaderRepoForUser } from "./repositories-read/todo/for-user.ts";
import { UserReaderRepoForAdmin } from "./repositories-read/user/for-admin.ts";
import { UserReaderRepoForGuest } from "./repositories-read/user/for-guest.ts";
import { UserReaderRepoForUser } from "./repositories-read/user/for-user.ts";
import { UnitOfWorkForAdmin } from "./unit-of-works/for-admin.ts";
import { UnitOfWorkForGuest } from "./unit-of-works/for-guest.ts";
import { UnitOfWorkForUser } from "./unit-of-works/for-user.ts";

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
  kysely: Kysely<DB>;
}): AppContext {
  const { user, kysely } = input;
  const kyselyReadonly = kysely as unknown as ReadonlyKysely<DB>;

  switch (user?.role) {
    case "ADMIN":
      return {
        role: user.role,
        user,
        queries: {
          todo: new TodoQueryForAdmin(kyselyReadonly),
          user: new UserQueryForAdmin(kyselyReadonly),
        },
        repos: {
          refreshToken: new RefreshTokenReaderRepo(kyselyReadonly),
          todo: new TodoReaderRepoForAdmin(kyselyReadonly, user.id),
          user: new UserReaderRepoForAdmin(kyselyReadonly, user.id),
        },
        unitOfWork: new UnitOfWorkForAdmin(kysely, user.id),
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
      };
    default:
      throw new Error(user satisfies never);
  }
}
