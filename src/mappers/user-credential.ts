import type * as Db from "../db/types.ts";
import type * as Domain from "../domain/user-credential.ts";

export const mappers = {
  toDb: ({ id, ...rest }: Domain.UserCredential): Db.UserCredential => ({
    ...rest,
    userId: id,
  }),
  toDomain: ({ userId, password }: Db.UserCredential): Domain.UserCredential => ({
    id: userId as Domain.UserCredential["id"],
    password: password as Domain.UserCredential["password"],
  }),
};
