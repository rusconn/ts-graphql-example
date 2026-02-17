import type { Transaction } from "kysely";

import type * as Domain from "../../domain/entities.ts";
import type { DB } from "../../infra/datasources/_shared/types.ts";
import { RefreshTokenRepoShared } from "../../infra/unit-of-works/db/_shared/refresh-token.ts";
import { TodoRepoShared } from "../../infra/unit-of-works/db/_shared/todo.ts";
import { UserRepoShared } from "../../infra/unit-of-works/db/_shared/user.ts";
import { type Context, createUserContextCore, type UserContext } from "../../server/context.ts";
import { logger } from "../../server/logger.ts";
import type { ContextForIT } from "./data/context/dynamic.ts";
import * as todos from "./data/graph/todos.ts";
import * as users from "./data/graph/users.ts";
import { CredentialQuery } from "./helpers/queries/credential.ts";
import { RefreshTokenQuery } from "./helpers/queries/refresh-token.ts";
import { TodoQuery } from "./helpers/queries/todo.ts";
import { UserQuery } from "./helpers/queries/user.ts";

export const dummyId = {
  todo: todos.dummyId,
  user: users.dummyId,
};

export type Queries = ReturnType<typeof createQueries>;

export const createQueries = (trx: Transaction<DB>) => ({
  credential: new CredentialQuery(trx),
  refreshToken: new RefreshTokenQuery(trx),
  todo: new TodoQuery(trx),
  user: new UserQuery(trx),
});

export const createRepos = (trx: Transaction<DB>) => ({
  refreshToken: new RefreshTokenRepoShared(trx),
  todo: new TodoRepoShared(trx),
  user: new UserRepoShared(trx),
});

export type Seeders = ReturnType<typeof createSeeders>;

export const createSeeders = (trx: Transaction<DB>) => {
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

export const createContext = (ctx: ContextForIT, trx: Transaction<DB>): Context => {
  return {
    request: ctx.request,
    ...createUserContext(ctx.user, trx),
  } as Context;
};

const createUserContext = (user: ContextForIT["user"], trx: Transaction<DB>): UserContext => {
  return {
    start: 0,
    logger,
    ...createUserContextCore(user, trx),
  };
};
