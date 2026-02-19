import type { Transaction } from "kysely";

import type * as Domain from "../src/domain/entities.ts";
import type * as Db from "../src/infrastructure/datasources/_shared/types.ts";
import { kysely } from "../src/infrastructure/datasources/db/client.ts";
import { CredentialQueryShared } from "../src/infrastructure/queries/db/credential/shared.ts";
import { TodoQueryShared } from "../src/infrastructure/queries/db/todo/shared.ts";
import { UserQueryShared } from "../src/infrastructure/queries/db/user/shared.ts";
import { RefreshTokenRepoShared } from "../src/infrastructure/unit-of-works/db/_shared/refresh-token.ts";
import { TodoRepoShared } from "../src/infrastructure/unit-of-works/db/_shared/todo.ts";
import { UserRepoShared } from "../src/infrastructure/unit-of-works/db/_shared/user.ts";
import * as UTHelpers from "../src/presentation/graphql/schema/_test/helpers.ts";

export const dummyId = UTHelpers.dummyId;

// E2Eで確認しにくいケースで使う
export const queries = {
  credential: new CredentialQueryShared(kysely),
  refreshToken: {
    async find(userId: Db.User["id"]) {
      return await kysely
        .selectFrom("refreshTokens")
        .where("userId", "=", userId)
        .selectAll()
        .execute();
    },
  },
  todo: new TodoQueryShared(kysely),
  user: new UserQueryShared(kysely),
};

export const clearTables = async () => {
  await Promise.all([
    clearRefreshTokens(), //
    clearTodos(),
  ]);
  await clearUsers(); // CASCADE
};

export const clearRefreshTokens = async () => {
  await kysely.deleteFrom("refreshTokens").execute();
};
export const clearTodos = async () => {
  await kysely.deleteFrom("todos").execute();
};
export const clearUsers = async () => {
  await kysely.deleteFrom("users").execute(); // CASCADE
};

export const seed = {
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

// テストだしトランザクション扱いしても大丈夫でしょ多分…
const repos = {
  refreshToken: new RefreshTokenRepoShared(kysely as Transaction<Db.DB>),
  todo: new TodoRepoShared(kysely as Transaction<Db.DB>),
  user: new UserRepoShared(kysely as Transaction<Db.DB>),
};
