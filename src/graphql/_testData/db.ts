import { db as todos } from "./db/todos.ts";
import { db as userCredentials } from "./db/user-credentials.ts";
import { db as users, db as userTokens } from "./db/users.ts";

export const db = {
  todos,
  users,
  userCredentials,
  userTokens,
};
