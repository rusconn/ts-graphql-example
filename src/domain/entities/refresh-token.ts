import { Result } from "neverthrow";
import type { Tagged } from "type-fest";

import * as Token from "./refresh-token/token.ts";
import * as User from "./user.ts";

export { Token };

export const MAX_RETENTION = 5;

export type Type = Tagged<
  {
    token: Token.TypeHashed;
    userId: User.Type["id"];
    lastUsedAt: Date;
  },
  "DomainRefreshToken"
>;

export const parse = (input: {
  token: Parameters<typeof Token.parseHashed>[0];
  userId: Parameters<typeof User.Id.parse>[0];
  lastUsedAt: Date;
}): Result<Type, ParseError[]> => {
  return Result.combineWithAllErrors([
    parseToken(input.token), //
    parseUserId(input.userId),
  ]).map(
    ([token, userId]) =>
      ({
        token,
        userId,
        lastUsedAt: input.lastUsedAt,
      }) as Type,
  );
};

export const parseUserId = (
  userId: Parameters<typeof User.Id.parse>[0],
): Result<User.Id.Type, UserIdError> => {
  return User.Id.parse(userId).mapErr((err) => ({
    prop: "userId",
    err,
  }));
};
export const parseToken = (
  token: Parameters<typeof Token.parseHashed>[0],
): Result<Token.TypeHashed, TokenError> => {
  return Token.parseHashed(token).mapErr((err) => ({
    prop: "token",
    err,
  }));
};

export type ParseError =
  | UserIdError //
  | TokenError;

export type UserIdError = {
  prop: "userId";
  err: User.Id.ParseError;
};
export type TokenError = {
  prop: "token";
  err: Token.ParseHashedError;
};

export const parseOrThrow = (input: Parameters<typeof parse>[0]): Type => {
  return parse(input)._unsafeUnwrap();
};

export const create = async (
  userId: Type["userId"],
): Promise<{ rawRefreshToken: Token.Type; refreshToken: Type }> => {
  const rawRefreshToken = Token.create();
  return {
    rawRefreshToken,
    refreshToken: {
      userId,
      token: await Token.hash(rawRefreshToken),
      lastUsedAt: new Date(),
    } as Type,
  };
};
