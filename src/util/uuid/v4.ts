import type { Tagged } from "type-fest";

import * as Uuid from "./vn.ts";

export type Uuidv4 = Tagged<Uuid.Uuid, "v4">;

export function gen() {
  return crypto.randomUUID() as Uuidv4;
}

export function is(input: unknown): input is Uuidv4 {
  return Uuid.is(input) && input.charAt(14) === "4";
}
