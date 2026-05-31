import { err, ok, type Result } from "neverthrow";
import type { Tagged } from "type-fest";

import { numChars } from "../../../lib/string/num-chars.ts";
import {
  type StringLengthTooLongError,
  stringLengthTooLongError,
} from "../_shared/parse-errors.ts";

export type Type = Tagged<string, "TodoTitle">;

export const MAX = 100;

export function parse(input: string): Result<Type, ParseError> {
  if (numChars(input) > MAX) {
    return err(stringLengthTooLongError);
  }

  return ok(input as Type);
}

export type ParseError = StringLengthTooLongError;

export function parseOrThrow(input: Parameters<typeof parse>[0]): Type {
  return parse(input)._unsafeUnwrap();
}
