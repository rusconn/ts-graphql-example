import { err, ok, type Result } from "neverthrow";

import { type InvalidFormatError, invalidFormatError } from "./parse-errors.ts";

export const parseHashed = <Hashed>(input: string): Result<Hashed, ParseHashedError> => {
  if (!BCRYPT_REGEX.test(input)) {
    return err(invalidFormatError);
  }

  return ok(input as Hashed);
};

const BCRYPT_REGEX = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}/;

export type ParseHashedError = InvalidFormatError;

export const parseHashedOrThrow = <Hashed>(input: string): Hashed => {
  return parseHashed<Hashed>(input)._unsafeUnwrap();
};
