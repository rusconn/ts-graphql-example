import { db as todos } from "./db/todo.ts";
import { db as users, db as userTokens } from "./db/user.ts";
import { db as userCredentials } from "./db/user-credential.ts";

export const db = {
  todos,
  users,
  userCredentials,
  userTokens,
};
