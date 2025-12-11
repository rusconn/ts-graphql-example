import type { Context } from "../../context.ts";
import { domain as users } from "./domain/users.ts";

export const context = {
  user: {
    ...users,
    guest: null,
  } satisfies Record<string, Context["user"]>,
};
