import type { User } from "./user.ts";
import * as RefreshToken from "./user-token/refresh-token.ts";

export { RefreshToken };

export type UserToken = {
  userId: User["id"];
  refreshToken: RefreshToken.RefreshTokenHashed;
  lastUsedAt: Date;
};

export const create = async (
  id: User["id"],
): Promise<{ rawToken: RefreshToken.RefreshToken; userToken: UserToken }> => {
  const rawToken = RefreshToken.gen();
  return {
    rawToken,
    userToken: {
      userId: id,
      refreshToken: await RefreshToken.hash(rawToken),
      lastUsedAt: new Date(),
    },
  };
};
