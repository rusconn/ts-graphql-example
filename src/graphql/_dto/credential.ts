import { Result } from "neverthrow";

import type * as Db from "../../infra/datasources/_shared/types.ts";
import * as Domain from "../../domain/models.ts";

export type Type = {
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
  ]).map(([userId, password]) => ({
    userId,
    password,
  }));
};

export type ParseError =
  | Domain.User.IdError //
  | Domain.User.PasswordError;

export const parseOrThrow = (input: Parameters<typeof parse>[0]) => {
  return parse(input)._unsafeUnwrap();
};
