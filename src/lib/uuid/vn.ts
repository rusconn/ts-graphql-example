import type { Tagged } from "type-fest";
import { validate } from "uuid";

import type * as NonEmptyString from "../string/nonEmptyString.ts";

export type Uuid = Tagged<NonEmptyString.NonEmptyString, "Uuid">;

export const is = (input: unknown): input is Uuid => {
  return validate(input);
};
