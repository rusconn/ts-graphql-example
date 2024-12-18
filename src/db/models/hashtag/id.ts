import type { Tagged } from "type-fest";

import type { UUIDv7 } from "../../../lib/uuid/v7.ts";
import * as uuidv7 from "../../../lib/uuid/v7.ts";

export type HashtagId = Tagged<UUIDv7, "HashtagId">;

export const is = (input: string): input is HashtagId => {
  return uuidv7.is(input);
};

export const gen = () => {
  return uuidv7.gen() as HashtagId;
};

export const date = (id: HashtagId) => {
  return uuidv7.date(id);
};
