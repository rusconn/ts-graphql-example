import type { Tagged } from "type-fest";

import type { UUIDv7 } from "../../../lib/uuid/v7.ts";
import * as uuidv7 from "../../../lib/uuid/v7.ts";

export type TagId = Tagged<UUIDv7, "TagId">;

export const is = (input: string): input is TagId => {
  return uuidv7.is(input);
};

export const gen = () => {
  return uuidv7.gen() as TagId;
};

export const date = (id: TagId) => {
  return uuidv7.date(id);
};
