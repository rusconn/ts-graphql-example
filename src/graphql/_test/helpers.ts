import type { Transaction } from "kysely";

import type * as Domain from "../../domain/entities.ts";
import type { DB, User } from "../../infra/datasources/_shared/types.ts";
import { CredentialQueryForAdmin } from "../../infra/queries/db/credential/for-admin.ts";
import { CredentialQueryForGuest } from "../../infra/queries/db/credential/for-guest.ts";
import { CredentialQueryForUser } from "../../infra/queries/db/credential/for-user.ts";
import { CredentialQueryShared } from "../../infra/queries/db/credential/shared.ts";
import { TodoQueryForAdmin } from "../../infra/queries/db/todo/for-admin.ts";
import { TodoQueryForUser } from "../../infra/queries/db/todo/for-user.ts";
import { TodoQueryShared } from "../../infra/queries/db/todo/shared.ts";
import { UserQueryForAdmin } from "../../infra/queries/db/user/for-admin.ts";
import { UserQueryForGuest } from "../../infra/queries/db/user/for-guest.ts";
import { UserQueryForUser } from "../../infra/queries/db/user/for-user.ts";
import { UserQueryShared } from "../../infra/queries/db/user/shared.ts";
import { TodoReaderRepoForAdmin } from "../../infra/repos-for-read/db/for-admin/todo.ts";
import { UserReaderRepoForAdmin } from "../../infra/repos-for-read/db/for-admin/user.ts";
import { TodoReaderRepoForUser } from "../../infra/repos-for-read/db/for-user/todo.ts";
import { UserReaderRepoForUser } from "../../infra/repos-for-read/db/for-user/user.ts";
import { RefreshTokenRepoShared } from "../../infra/unit-of-works/db/_shared/refresh-token.ts";
import { TodoRepoShared } from "../../infra/unit-of-works/db/_shared/todo.ts";
import { UserRepoShared } from "../../infra/unit-of-works/db/_shared/user.ts";
import { UnitOfWorkForAdmin } from "../../infra/unit-of-works/db/for-admin.ts";
import { UnitOfWorkForGuest } from "../../infra/unit-of-works/db/for-guest.ts";
import { UnitOfWorkForUser } from "../../infra/unit-of-works/db/for-user.ts";
import type { Context, ContextBase, UserContext } from "../../server/context.ts";
import { logger } from "../../server/logger.ts";

// TODO: テスト用のクエリサービスを実装して利用する
export const createQueries = (trx: Transaction<DB>) => ({
  credential: new CredentialQueryShared(trx),
  refreshToken: {
    async find(userId: User["id"]) {
      return await trx
        .selectFrom("refreshTokens")
        .where("userId", "=", userId)
        .selectAll()
        .execute();
    },
  },
  todo: new TodoQueryShared(trx),
  user: new UserQueryShared(trx),
});

export const createRepos = (trx: Transaction<DB>) => ({
  refreshToken: new RefreshTokenRepoShared(trx),
  todo: new TodoRepoShared(trx),
  user: new UserRepoShared(trx),
});

export const createSeeder = (trx: Transaction<DB>) => {
  const repos = createRepos(trx);

  return {
    async refreshTokens(...refreshTokens: Domain.RefreshToken.Type[]) {
      await Promise.all(
        refreshTokens.map(async (refreshToken) => {
          await repos.refreshToken.add(refreshToken);
        }),
      );
    },
    async users(...users: Domain.User.Type[]) {
      await Promise.all(
        users.map(async (user) => {
          await repos.user.add(user);
        }),
      );
    },
    async todos(...todos: Domain.Todo.Type[]) {
      await Promise.all(
        todos.map(async (todo) => {
          await repos.todo.add(todo);
        }),
      );
    },
  };
};

export const createContext = (input: {
  user: UserContext["user"];
  trx: Transaction<DB>;
}): Context => {
  return createUserContext(input) as Context;
};

const createUserContext = (input: {
  user: UserContext["user"];
  trx: Transaction<DB>;
}): UserContext => {
  const { user, trx } = input;

  const contextBase: ContextBase = {
    start: 0,
    logger,
  };

  switch (user?.role) {
    case "ADMIN":
      return {
        ...contextBase,
        role: user.role,
        user,
        queries: {
          credential: new CredentialQueryForAdmin(trx, user.id),
          todo: new TodoQueryForAdmin(trx),
          user: new UserQueryForAdmin(trx),
        },
        repos: {
          todo: new TodoReaderRepoForAdmin(trx, user.id),
          user: new UserReaderRepoForAdmin(trx, user.id),
        },
        unitOfWork: new UnitOfWorkForAdmin(trx, user.id),
      };
    case "USER":
      return {
        ...contextBase,
        role: user.role,
        user,
        queries: {
          credential: new CredentialQueryForUser(trx, user.id),
          todo: new TodoQueryForUser(trx, user.id),
          user: new UserQueryForUser(trx, user.id),
        },
        repos: {
          todo: new TodoReaderRepoForUser(trx, user.id),
          user: new UserReaderRepoForUser(trx, user.id),
        },
        unitOfWork: new UnitOfWorkForUser(trx, user.id),
      };
    case undefined:
      return {
        ...contextBase,
        role: "GUEST",
        user: null,
        queries: {
          credential: new CredentialQueryForGuest(trx),
          user: new UserQueryForGuest(trx),
        },
        unitOfWork: new UnitOfWorkForGuest(trx),
      };
    default:
      throw new Error(user satisfies never);
  }
};
