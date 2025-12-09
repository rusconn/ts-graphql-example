import * as todos from "./data/todo.ts";
import * as users from "./data/user.ts";
import * as userCredentials from "./data/user-credential.ts";
import * as userTokens from "./data/user-token.ts";

export const tokens = users.token;
export const refreshTokens = users.refreshToken;

export const db = {
  todos: todos.db,
  users: {
    admin: {
      ...users.db.admin,
      password: userCredentials.db.admin.password,
      token: userTokens.db.admin.token,
    },
    alice: {
      ...users.db.alice,
      password: userCredentials.db.alice.password,
      token: userTokens.db.alice.token,
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
