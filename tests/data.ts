import * as todos from "./data/todos.ts";
import * as userCredentials from "./data/user-credentials.ts";
import * as userTokens from "./data/user-tokens.ts";
import * as users from "./data/users.ts";

export const tokens = users.token;
export const refreshTokens = users.refreshToken;

export const db = {
  todos: todos.db,
  users: {
    admin: {
      ...users.db.admin,
      password: userCredentials.db.admin.password,
      refreshToken: userTokens.db.admin.refreshToken,
      lastUsedAt: userTokens.db.admin.lastUsedAt,
    },
    alice: {
      ...users.db.alice,
      password: userCredentials.db.alice.password,
      refreshToken: userTokens.db.alice.refreshToken,
      lastUsedAt: userTokens.db.alice.lastUsedAt,
    },
  },
};

export const graph = {
  todos: todos.graph,
  users: users.graph,
};

export const dummyId = {
  todo: todos.dummyId,
  user: users.dummyId,
};
