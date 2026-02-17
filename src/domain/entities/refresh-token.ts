import { err, Result } from "neverthrow";
import type { Tagged } from "type-fest";

import { addDates } from "../../util/date.ts";
import * as Token from "./refresh-token/token.ts";
import * as User from "./user.ts";

export { Token };

export const MAX_RETENTION = 5;

export type Type = Tagged<Raw, "RefreshTokenEntity">;

type Raw = {
  token: Token.TypeHashed;
  userId: User.Type["id"];
  expiresAt: Date;
  createdAt: Date;
};

export const parse = (input: {
  token: Parameters<typeof Token.parseHashed>[0];
  userId: Parameters<typeof User.Id.parse>[0];
  expiresAt: Date;
  createdAt: Date;
}): Result<Type, ParseError[]> => {
  if (input.expiresAt < input.createdAt) {
    return err([
      {
        prop: "expiresAt",
        err: { type: "less than createdAt" },
      },
    ]);
  }

  return Result.combineWithAllErrors([
    parseToken(input.token), //
    parseUserId(input.userId),
  ]).map(
    ([token, userId]) =>
      ({
        token,
        userId,
        expiresAt: input.expiresAt,
        createdAt: input.createdAt,
      }) satisfies Raw as Type,
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
  | TokenError //
  | UserIdError
  | ExpiresAtError;

export type TokenError = {
  prop: "token";
  err: Token.ParseHashedError;
};
export type UserIdError = {
  prop: "userId";
  err: User.Id.ParseError;
};
export type ExpiresAtError = {
  prop: "expiresAt";
  err: { type: "less than createdAt" };
};

export const parseOrThrow = (input: Parameters<typeof parse>[0]): Type => {
  return parse(input)._unsafeUnwrap();
};

export const create = async (
  userId: Type["userId"],
): Promise<{ rawRefreshToken: Token.Type; refreshToken: Type }> => {
  const rawRefreshToken = Token.create();
  const createdAt = new Date();
  const expiresAt = addDates(createdAt, 7);

  return {
    rawRefreshToken,
    refreshToken: {
      userId,
      token: await Token.hash(rawRefreshToken),
      expiresAt,
      createdAt,
    } satisfies Raw as Type,
  };
};

export const isExpired = (refreshToken: Type): boolean => {
  return refreshToken.expiresAt < new Date();
};
