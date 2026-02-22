import { Result } from "neverthrow";
import type { Tagged } from "type-fest";

import * as Domain from "../../domain/entities.ts";
import type * as Db from "../../infrastructure/datasources/_shared/types.ts";

export type Type = Tagged<Raw, "RefreshTokenDto">;

type Raw = Pick<
  Domain.RefreshToken.Type,
  | "token" //
  | "userId"
  | "expiresAt"
  | "createdAt"
>;

export const parse = (
  input: Pick<
    Db.RefreshToken,
    | "token" //
    | "userId"
    | "expiresAt"
    | "createdAt"
  >,
): Result<Type, ParseError[]> => {
  return Result.combineWithAllErrors([
    Domain.RefreshToken.parseToken(input.token),
    Domain.RefreshToken.parseUserId(input.userId),
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

export type ParseError =
  | Domain.RefreshToken.TokenError //
  | Domain.RefreshToken.UserIdError;

export const parseOrThrow = (input: Parameters<typeof parse>[0]) => {
  return parse(input)._unsafeUnwrap();
};

export const fromDomain = (domain: Domain.RefreshToken.Type): Type =>
  ({
    token: domain.token,
    userId: domain.userId,
    expiresAt: domain.expiresAt,
    createdAt: domain.createdAt,
  }) satisfies Raw as Type;
