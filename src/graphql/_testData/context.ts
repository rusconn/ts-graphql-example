import type { Context } from "../../context.ts";
import { db as users } from "./db/user.ts";

export const context = {
  user: {
    ...users,
    guest: null,
  } satisfies Record<string, Context["user"]>,
};
