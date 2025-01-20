import { db as todos } from "./db/todo.ts";
import { db as users } from "./db/user.ts";

export const db = {
  ...todos,
  ...users,
} as const;
