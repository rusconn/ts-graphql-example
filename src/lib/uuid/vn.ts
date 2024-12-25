import type { Tagged } from "type-fest";
import { validate } from "uuid";

export type UUID = Tagged<string, "UUID">;

export const is = (input: string): input is UUID => {
  return validate(input);
};
