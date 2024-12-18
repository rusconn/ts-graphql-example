import type { Tagged } from "type-fest";

import type { UUIDv7 } from "../../../lib/uuid/v7.ts";
import * as uuidv7 from "../../../lib/uuid/v7.ts";

export type LikeId = Tagged<UUIDv7, "LikeId">;

export const is = (input: string): input is LikeId => {
  return uuidv7.is(input);
};

export const gen = () => {
  return uuidv7.gen() as LikeId;
};

export const date = (id: LikeId) => {
  return uuidv7.date(id);
};
