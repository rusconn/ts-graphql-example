import { db as todos } from "./db/todos.ts";
import { db as userCredentials } from "./db/user-credentials.ts";
import { db as userTokens } from "./db/user-tokens.ts";
import { db as users } from "./db/users.ts";

export const db = {
  todos,
  userCredentials,
  userTokens,
  users,
};
