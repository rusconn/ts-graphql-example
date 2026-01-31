import type * as Db from "../db/types.ts";
import type * as Domain from "../domain/user.ts";
import type { UserToken } from "../domain/user-token.ts";
import { mappers } from "../mappers.ts";
import type { UserBase } from "./user-base.ts";

export type UserWithToken = UserBase & Pick<UserToken, "refreshToken">;

type Input = Db.User & Pick<Db.UserToken, "refreshToken">;

export const from = ({ id, email, role, refreshToken, ...rest }: Input): UserWithToken => ({
  ...rest,
  id: id as Domain.User["id"],
  email: email as Domain.User["email"],
  role: mappers.user.role.toDomain(role),
  refreshToken: refreshToken as UserToken["refreshToken"],
});
