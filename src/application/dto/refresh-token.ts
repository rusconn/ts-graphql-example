import { Result } from "neverthrow";
import type { Tagged } from "type-fest";

import * as Domain from "../../domain/entities.ts";

export type Type = Tagged<Raw, "RefreshTokenDto">;

type Raw = Pick<
  Domain.RefreshToken.Type,
  | "token" //
  | "userId"
  | "expiresAt"
  | "createdAt"
>;

type Input = {
  token: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
};

export function parse(input: Input): Result<Type, ParseError[]> {
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
}

export type ParseError =
  | Domain.RefreshToken.TokenError //
  | Domain.RefreshToken.UserIdError;

export function parseOrThrow(input: Input) {
  return parse(input)._unsafeUnwrap();
}

export function fromDomain(domain: Domain.RefreshToken.Type): Type {
  return {
    token: domain.token,
    userId: domain.userId,
    expiresAt: domain.expiresAt,
    createdAt: domain.createdAt,
  } satisfies Raw as Type;
}
