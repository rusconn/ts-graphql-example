import type { Tagged } from "type-fest";

import { numChars } from "../../../lib/string/numChars.ts";

export type HashtagName = Tagged<string, "HashtagName">;

export const is = (input: string): input is HashtagName => {
  return input !== "" && numChars(input) <= 50;
};
