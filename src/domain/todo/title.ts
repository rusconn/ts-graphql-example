import type { Tagged } from "type-fest";

import { numChars } from "../../lib/string/numChars.ts";

export type Type = Tagged<string, "TodoTitle">;

export const MAX = 100;

export const parse = (input: string): Type | ParseError[] => {
  const errors: ParseError[] = [];

  if (numChars(input) > MAX) {
    errors.push("too long");
  }

  return errors.length ? errors : (input as Type);
};

export type ParseError = "too long";
