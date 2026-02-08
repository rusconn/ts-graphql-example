import { db as credentials } from "./db/credentials.ts";
import { db as refreshTokens } from "./db/refresh-tokens.ts";
import { db as todos } from "./db/todos.ts";
import { db as users } from "./db/users.ts";

export const db = {
  credentials,
  refreshTokens,
  todos,
  users,
};
