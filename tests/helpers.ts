import { kysely } from "../src/infra/datasources/db/client.ts";
import type * as Db from "../src/infra/datasources/_shared/types.ts";
import type * as Domain from "../src/domain/models.ts";
import { CredentialQueryShared } from "../src/infra/queries/db/credential/shared.ts";
import { TodoQueryShared } from "../src/infra/queries/db/todo/shared.ts";
import { UserQueryShared } from "../src/infra/queries/db/user/shared.ts";
import { RefreshTokenRepoShared } from "../src/infra/repos/db/refresh-token/shared.ts";
import { TodoRepoShared } from "../src/infra/repos/db/todo/shared.ts";
import { UserRepoShared } from "../src/infra/repos/db/user/shared.ts";
import * as todos from "./data/graph/todos.ts";
import * as users from "./data/graph/users.ts";

export const dummyId = {
  todo: todos.dummyId,
  user: users.dummyId,
};

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
    await kysely.transaction().execute(async (trx) => {
      await Promise.all(
        refreshTokens.map(async (refreshToken) => {
          await repos.refreshToken.add(refreshToken, trx);
        }),
      );
    });
  },
  async users(...users: Domain.User.Type[]) {
    await kysely.transaction().execute(async (trx) => {
      await Promise.all(
        users.map(async (user) => {
          await repos.user.add(user, trx);
        }),
      );
    });
  },
  async todos(...todos: Domain.Todo.Type[]) {
    await kysely.transaction().execute(async (trx) => {
      await Promise.all(
        todos.map(async (todo) => {
          await repos.todo.add(todo, trx);
        }),
      );
    });
  },
};

const repos = {
  refreshToken: new RefreshTokenRepoShared(kysely),
  todo: new TodoRepoShared(kysely),
  user: new UserRepoShared(kysely),
};
