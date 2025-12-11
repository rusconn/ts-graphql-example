import type { Context } from "../../context.ts";
import { db as users } from "./db/users.ts";

export const context = {
  user: {
    ...users,
    guest: null,
  } satisfies Record<string, Context["user"]>,
};
