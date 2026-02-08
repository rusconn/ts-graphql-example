import * as Token from "./refresh-token/token.ts";
import type * as User from "./user.ts";

export { Token };

export const MAX_RETENTION = 5;

export type Type = {
  id: User.Type["id"];
  token: Token.TypeHashed;
  lastUsedAt: Date;
};

export const create = async (
  id: Type["id"],
): Promise<{ rawRefreshToken: Token.Type; refreshToken: Type }> => {
  const rawRefreshToken = Token.create();
  return {
    rawRefreshToken,
    refreshToken: {
      id,
      token: await Token.hash(rawRefreshToken),
      lastUsedAt: new Date(),
    },
  };
};
