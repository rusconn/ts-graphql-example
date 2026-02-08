import bcrypt from "bcrypt";
import type { Tagged } from "type-fest";

import { passHashExp } from "../../config/hash.ts";
import { numChars } from "../../lib/string/numChars.ts";

export type Type = Tagged<string, "UserPassword">;
export type TypeHashed = Tagged<Type, "Hashed">;

export const MIN = 8;
export const MAX = 50;

export const parse = (input: string): Type | ParseError[] => {
  const errors: ParseError[] = [];

  const chars = numChars(input);
  if (chars < MIN) {
    errors.push("too short");
  }
  if (MAX < chars) {
    errors.push("too long");
  }

  return errors.length ? errors : (input as Type);
};

export type ParseError =
  | "too short" //
  | "too long";

export const hash = async (source: Type) => {
  const hashed = await bcrypt.hash(source, passHashExp);
  return hashed as TypeHashed;
};

export const match = async (source: Type, hashed: TypeHashed) => {
  return await bcrypt.compare(source, hashed);
};
