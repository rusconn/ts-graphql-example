import type { Tagged } from "type-fest";

import type { NonEmptyString } from "../../../lib/string/nonEmptyString.ts";

export type TodoTitle = Tagged<NonEmptyString, "TodoTitle">;

export const is = (s: NonEmptyString): s is TodoTitle => {
  return s.length <= 255;
};
