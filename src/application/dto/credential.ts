import { Result } from "neverthrow";
import type { Tagged } from "type-fest";

import * as Domain from "../../domain/entities.ts";
import type * as Db from "../../infrastructure/datasources/_shared/types.ts";

export type Type = Tagged<Raw, "CredentialDto">;

type Raw = {
  userId: Domain.User.Type["id"];
  password: Domain.User.Type["password"];
};

export const parse = (input: {
  userId: Db.User["id"];
  password: Db.Credential["password"];
}): Result<Type, ParseError[]> => {
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
};

export type ParseError =
  | Domain.User.IdError //
  | Domain.User.PasswordError;

export const parseOrThrow = (input: Parameters<typeof parse>[0]) => {
  return parse(input)._unsafeUnwrap();
};
