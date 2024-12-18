import type { Tagged } from "type-fest";
import { numChars } from "../../../lib/string/numChars.ts";

export type UserName = Tagged<string, "UserName">;

export const is = (input: string): input is UserName => {
  return numChars(input) <= 15;
};
