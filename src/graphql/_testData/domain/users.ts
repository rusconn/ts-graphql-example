import type * as Domain from "../../../domain/user.ts";
import { mappers } from "../../../mappers.ts";
import { db as users } from "../db/users.ts";

export const domain = {
  admin: mappers.user.toDomain(users.admin),
  alice: mappers.user.toDomain(users.alice),
} satisfies Record<string, Domain.User>;
