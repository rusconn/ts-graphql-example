import type { Tagged } from "type-fest";
import { validate } from "uuid";

export type Uuid = Tagged<string, "Uuid">;

export const is = (input: string): input is Uuid => {
  return validate(input);
};
