import type * as Db from "../db/types.ts";
import type * as Domain from "../domain/user.ts";
import { mappers as role } from "./user/role.ts";

export const mappers = {
  toDb: ({ id, role: role_, ...rest }: Domain.User): Db.User => ({
    ...rest,
    id,
    role: role.toDb(role_),
  }),
  toDomain: ({ id, email, role: role_, ...rest }: Db.User): Domain.User => ({
    ...rest,
    id: id as Domain.User["id"],
    email: email as Domain.User["email"],
    role: role.toDomain(role_),
  }),
  role,
};
