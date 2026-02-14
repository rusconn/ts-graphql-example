import { err, ok, type Result } from "neverthrow";
import type { Tagged } from "type-fest";

import * as EmailAddress from "../../../lib/string/email-address.ts";
import { numChars } from "../../../lib/string/num-chars.ts";
import {
  type InvalidFormatError,
  invalidFormatError,
  type StringLengthTooLongError,
  stringLengthTooLongError,
} from "../_shared/parse-errors.ts";

export type Type = Tagged<EmailAddress.EmailAddress, "UserProfileEmail">;

export const MAX = 100;

export const parse = (input: string): Result<Type, ParseError> => {
  if (!EmailAddress.is(input)) {
    return err(invalidFormatError);
  }
  if (numChars(input) > MAX) {
    return err(stringLengthTooLongError);
  }

  return ok(input as Type);
};

export type ParseError =
  | InvalidFormatError //
  | StringLengthTooLongError;

export const parseOrThrow = (input: string): Type => {
  return parse(input)._unsafeUnwrap();
};
