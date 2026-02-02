import type { Context } from "../../context.ts";
import { db as users } from "./db/users.ts";

export const ctx = {
  user: {
    ...users,
    guest: null,
  } satisfies Record<string, Context["user"]>,
};
