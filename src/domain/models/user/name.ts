import { err, ok, type Result } from "neverthrow";
import type { Tagged } from "type-fest";

import { numChars } from "../../../lib/string/numChars.ts";
import {
  type StringLengthTooLongError,
  type StringLengthTooShortError,
  stringLengthTooLongError,
  stringLengthTooShortError,
} from "../_shared/parse-errors.ts";

export type Type = Tagged<string, "UserProfileName">;

export const MIN = 1;
export const MAX = 100;

export const parse = (input: string): Result<Type, ParseError> => {
  const chars = numChars(input);
  if (chars < MIN) {
    return err(stringLengthTooShortError);
  }
  if (MAX < chars) {
    return err(stringLengthTooLongError);
  }

  return ok(input as Type);
};

export type ParseError =
  | StringLengthTooShortError //
  | StringLengthTooLongError;

export const parseOrThrow = (input: string): Type => {
  return parse(input)._unsafeUnwrap();
};
