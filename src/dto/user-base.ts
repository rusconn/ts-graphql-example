import type { Except } from "type-fest";

import type * as Db from "../db/types.ts";
import type * as Domain from "../domain/user.ts";
import { mappers } from "../mappers.ts";

export type UserBase = Except<Domain.User, "password">;

export const from = ({ id, email, role, ...rest }: Db.User): UserBase => ({
  ...rest,
  id: id as Domain.User["id"],
  email: email as Domain.User["email"],
  role: mappers.user.role.toDomain(role),
});
