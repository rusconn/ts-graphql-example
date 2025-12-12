import type { User } from "./user.ts";
import * as Token from "./user-token/token.ts";

export { Token };

export type UserToken = {
  userId: User["id"];
  token: Token.TokenHashed;
};

export const create = async (
  id: User["id"],
): Promise<{ rawToken: Token.Token; userToken: UserToken }> => {
  const rawToken = Token.gen();
  return {
    rawToken,
    userToken: {
      userId: id,
      token: await Token.hash(rawToken),
    },
  };
};
