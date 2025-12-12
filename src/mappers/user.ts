import type * as Db from "../db/types.ts";
import * as Domain from "../domain/user.ts";
import { mappers as role } from "./user/role.ts";

export const mappers = {
  toDb: ({
    id,
    role: role_,
    password,
    createdAt: _,
    ...rest
  }: Domain.User): { user: Db.User; userCredential: Db.UserCredential } => ({
    user: { ...rest, id, role: role.toDb(role_) },
    userCredential: { userId: id, password },
  }),
  toDomain: ({
    id,
    email,
    password,
    role: role_,
    ...rest
  }: Db.User & Pick<Db.UserCredential, "password">): Domain.User => ({
    ...rest,
    id: id as Domain.User["id"],
    email: email as Domain.User["email"],
    password: password as Domain.User["password"],
    role: role.toDomain(role_),
    createdAt: Domain.UserId.date(id as Domain.User["id"]),
  }),
  role,
};
