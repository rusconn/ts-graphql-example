import type { Context } from "../../context.ts";
import { db as users } from "./db/users.ts";

export const context = {
  admin: {
    role: "admin",
    user: users.admin,
  },
  alice: {
    role: "user",
    user: users.alice,
  },
  guest: {
    role: "guest",
    user: null,
  },
} as const satisfies Record<string, Pick<Context, "role" | "user">>;
