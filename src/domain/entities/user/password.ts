import bcrypt from "bcrypt";
import { err, ok, type Result } from "neverthrow";
import type { Tagged } from "type-fest";

import { passwordHashExp } from "../../../config/password-hash.ts";
import { numChars } from "../../../lib/string/num-chars.ts";
import * as Bcrypt from "../_shared/bcrypt.ts";
import {
  type StringLengthTooLongError,
  type StringLengthTooShortError,
  stringLengthTooLongError,
  stringLengthTooShortError,
} from "../_shared/parse-errors.ts";

export type Type = Tagged<string, "UserPassword">;
export type TypeHashed = Tagged<Type, "Hashed">;

export const MIN = 8;
export const MAX = 50;

export function parse(input: string): Result<Type, ParseError> {
  const chars = numChars(input);
  if (chars < MIN) {
    return err(stringLengthTooShortError);
  }
  if (MAX < chars) {
    return err(stringLengthTooLongError);
  }

  return ok(input as Type);
}

export type ParseError =
  | StringLengthTooShortError //
  | StringLengthTooLongError;

export function parseOrThrow(input: Parameters<typeof parse>[0]): Type {
  return parse(input)._unsafeUnwrap();
}

export function parseHashed(input: string): Result<TypeHashed, ParseHashedError> {
  return Bcrypt.parseHashed(input);
}

export type ParseHashedError = Bcrypt.ParseHashedError;

export function parseHashedOrThrow(input: string): Result<TypeHashed, ParseHashedError> {
  return Bcrypt.parseHashedOrThrow(input);
}

export async function hash(source: Type) {
  const hashed = await bcrypt.hash(source, passwordHashExp);
  return hashed as TypeHashed;
}

export async function match(source: Type, hashed: TypeHashed) {
  return await bcrypt.compare(source, hashed);
}
