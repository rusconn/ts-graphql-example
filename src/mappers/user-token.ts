import type * as Db from "../db/types.ts";
import type * as Domain from "../domain/user-token.ts";

export const mappers = {
  toDb: (userToken: Domain.UserToken): Db.UserToken => {
    return userToken as Db.UserToken;
  },
  toDomain: (userToken: Db.UserToken): Domain.UserToken => {
    return userToken as Domain.UserToken;
  },
};
