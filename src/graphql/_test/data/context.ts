import type { Context } from "../../../server/context.ts";
import { dto } from "./dto.ts";

export type ContextForTest = (typeof context)[keyof typeof context];

export const context = {
  admin: {
    role: "ADMIN",
    user: dto.users.admin,
  },
  alice: {
    role: "USER",
    user: dto.users.alice,
  },
  guest: {
    role: "GUEST",
    user: null,
  },
} as const satisfies Record<string, Pick<Context, "role" | "user">>;
