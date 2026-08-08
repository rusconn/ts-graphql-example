import type { Transaction } from "kysely";

import type * as Domain from "../../../../domain/entities.ts";
import type { DB } from "../../../../infrastructure/datasources/db/types.ts";
import { RefreshTokenRepo } from "../../../../infrastructure/repositories/refresh-token.ts";
import { TodoRepo } from "../../../../infrastructure/repositories/todo.ts";
import { UserRepo } from "../../../../infrastructure/repositories/user.ts";
import { CredentialQuery } from "./queries/credential.ts";
import { RefreshTokenQuery } from "./queries/refresh-token.ts";
import { TodoQuery } from "./queries/todo.ts";
import { UserQuery } from "./queries/user.ts";

export type Queries = ReturnType<typeof createQueries>;

export function createQueries(trx: Transaction<DB>) {
  return {
    credential: new CredentialQuery(trx),
    refreshToken: new RefreshTokenQuery(trx),
    todo: new TodoQuery(trx),
    user: new UserQuery(trx),
  };
}

export function createRepos(trx: Transaction<DB>) {
  return {
    refreshToken: new RefreshTokenRepo(trx),
    todo: new TodoRepo(trx),
    user: new UserRepo(trx),
  };
}

export type Seeders = ReturnType<typeof createSeeders>;

export function createSeeders(trx: Transaction<DB>) {
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
}
