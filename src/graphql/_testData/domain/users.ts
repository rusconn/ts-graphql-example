import type * as Domain from "../../../domain/user.ts";
import { mappers } from "../../../mappers.ts";
import { db as userCredentials } from "../db/user-credentials.ts";
import { db as users } from "../db/users.ts";

export const domain = {
  admin: mappers.user.toDomain({
    ...users.admin,
    password: userCredentials.admin.password,
  }),
  alice: mappers.user.toDomain({
    ...users.alice,
    password: userCredentials.alice.password,
  }),
} satisfies Record<string, Domain.User>;
