import bcrypt from "bcrypt";
import { err, ok, type Result } from "neverthrow";
import type { Tagged } from "type-fest";

import { passHashExp } from "../../../config/hash.ts";
import { numChars } from "../../../lib/string/numChars.ts";
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

export const parseOrThrow = (input: Parameters<typeof parse>[0]): Type => {
  return parse(input)._unsafeUnwrap();
};

export const parseHashed = Bcrypt.parseHashed<TypeHashed>;

export type ParseHashedError = Bcrypt.ParseHashedError;

export const parseHashedOrThrow = Bcrypt.parseHashedOrThrow<TypeHashed>;

export const hash = async (source: Type) => {
  const hashed = await bcrypt.hash(source, passHashExp);
  return hashed as TypeHashed;
};

export const match = async (source: Type, hashed: TypeHashed) => {
  return await bcrypt.compare(source, hashed);
};
