import { dto } from "../../../../../_shared/test/data/dto.ts";
import type { Context } from "../../../../yoga/context.ts";

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
