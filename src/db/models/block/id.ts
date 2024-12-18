import type { Tagged } from "type-fest";

import type { UUIDv7 } from "../../../lib/uuid/v7.ts";
import * as uuidv7 from "../../../lib/uuid/v7.ts";

export type BlockId = Tagged<UUIDv7, "BlockId">;

export const is = (input: string): input is BlockId => {
  return uuidv7.is(input);
};

export const gen = () => {
  return uuidv7.gen() as BlockId;
};

export const date = (id: BlockId) => {
  return uuidv7.date(id);
};
