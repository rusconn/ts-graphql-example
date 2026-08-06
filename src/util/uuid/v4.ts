import type { Tagged } from "type-fest";

import * as UuidV4 from "../../lib/uuid/v4.ts";
import type { Uuid } from "./vn.ts";

export type Uuidv4 = Tagged<Uuid, "v4">;

export function gen(): Uuidv4 {
  return UuidV4.gen() as Uuidv4;
}

export function is(input: unknown): input is Uuidv4 {
  return UuidV4.is(input);
}
