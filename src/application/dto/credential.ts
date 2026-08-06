import { Result } from "neverthrow";
import type { Tagged } from "type-fest";

import * as Domain from "../../domain/entities.ts";

export type Type = Tagged<Raw, "CredentialDto">;

type Raw = {
  userId: Domain.User.Type["id"];
  password: Domain.User.Type["password"];
};

type Input = {
  userId: string;
  password: string;
};

export function parse(input: Input): Result<Type, ParseError[]> {
  return Result.combineWithAllErrors([
    Domain.User.parseId(input.userId),
    Domain.User.parsePassword(input.password),
  ]).map(
    ([userId, password]) =>
      ({
        userId,
        password,
      }) satisfies Raw as Type,
  );
}

export type ParseError =
  | Domain.User.IdError //
  | Domain.User.PasswordError;

export function parseOrThrow(input: Input) {
  return parse(input)._unsafeUnwrap();
}
