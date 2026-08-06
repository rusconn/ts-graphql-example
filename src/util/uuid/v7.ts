import type { Tagged } from "type-fest";

import * as UuidV7 from "../../lib/uuid/v7.ts";
import type { Uuid } from "./vn.ts";

export type Uuidv7 = Tagged<Uuid, "v7">;

export function gen(): Uuidv7 {
  return UuidV7.gen() as Uuidv7;
}

export function is(input: unknown): input is Uuidv7 {
  return UuidV7.is(input);
}

export function date(id: Uuidv7) {
  return UuidV7.date(id);
}
