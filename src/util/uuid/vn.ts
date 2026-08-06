import type { Tagged } from "type-fest";

import * as UuidBase from "../../lib/uuid/vn.ts";

export type Uuid = Tagged<string, "Uuid">;

export function is(input: unknown): input is Uuid {
  return UuidBase.is(input);
}
