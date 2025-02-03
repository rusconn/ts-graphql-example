import type { Tagged } from "type-fest";

import type { NonEmptyString } from "../../../lib/string/nonEmptyString.ts";

export type UserName = Tagged<NonEmptyString, "UserName">;

export const is = (s: NonEmptyString): s is UserName => {
  return s.length <= 255;
};
