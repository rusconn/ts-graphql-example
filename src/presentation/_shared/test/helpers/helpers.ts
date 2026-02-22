import type { Transaction } from "kysely";

import type * as Domain from "../../../../domain/entities.ts";
import type { DB } from "../../../../infrastructure/datasources/_shared/types.ts";
import { RefreshTokenRepoShared } from "../../../../infrastructure/unit-of-works/db/_shared/refresh-token.ts";
import { TodoRepoShared } from "../../../../infrastructure/unit-of-works/db/_shared/todo.ts";
import { UserRepoShared } from "../../../../infrastructure/unit-of-works/db/_shared/user.ts";
import { CredentialQuery } from "./queries/credential.ts";
import { RefreshTokenQuery } from "./queries/refresh-token.ts";
import { TodoQuery } from "./queries/todo.ts";
import { UserQuery } from "./queries/user.ts";

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
