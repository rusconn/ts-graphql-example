import { refreshTokens as clientRefreshTokens } from "./data/client/refresh-tokens.ts";
import { tokens as clientTokens } from "./data/client/tokens.ts";
import { db as dbCredentials } from "./data/db/credentials.ts";
import { db as dbRefreshTokens } from "./data/db/refresh-tokens.ts";
import { db as dbTodos } from "./data/db/todos.ts";
import { db as dbUsers } from "./data/db/users.ts";
import { domain as domainRefreshTokens } from "./data/domain/refresh-tokens.ts";
import { domain as domainTodos } from "./data/domain/todos.ts";
import { domain as domainUsers } from "./data/domain/users.ts";
import { graph as graphnTodos } from "./data/graph/todos.ts";
import { graph as graphUsers } from "./data/graph/users.ts";

export const client = {
  refreshTokens: clientRefreshTokens,
  tokens: clientTokens,
};

export const db = {
  credentials: dbCredentials,
  refreshTokens: dbRefreshTokens,
  todos: dbTodos,
  users: dbUsers,
};

export const domain = {
  refreshTokens: domainRefreshTokens,
  todos: domainTodos,
  users: domainUsers,
};

export const graph = {
  todos: graphnTodos,
  users: graphUsers,
};
