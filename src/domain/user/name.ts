import type { Tagged } from "type-fest";

import { numChars } from "../../lib/string/numChars.ts";

export type Type = Tagged<string, "UserName">;

export const MIN = 1;
export const MAX = 100;

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
