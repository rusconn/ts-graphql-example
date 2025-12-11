import type * as Db from "../db/types.ts";
import * as Domain from "../domain/user.ts";
import { mappers } from "../mappers.ts";
import type { UserBase } from "./user-base.ts";

export type UserWithToken = UserBase & Pick<Domain.UserToken, "token">;

type Input = Db.User & Pick<Db.UserToken, "token">;

export const from = ({ id, email, role, token, ...rest }: Input): UserWithToken => ({
  ...rest,
  id: id as Domain.User["id"],
  email: email as Domain.User["email"],
  role: mappers.user.role.toDomain(role),
  token: token as Domain.UserToken["token"],
  createdAt: Domain.UserId.date(id as Domain.User["id"]),
});
