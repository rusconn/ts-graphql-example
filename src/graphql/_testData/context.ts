import type { Context } from "../../context.ts";
import { db } from "./db/user.ts";

export const context = {
  ...db,
  guest: null,
} as const satisfies Record<string, Context["user"]>;
