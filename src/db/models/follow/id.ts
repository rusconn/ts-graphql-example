import type { Tagged } from "type-fest";

import type { UUIDv7 } from "../../../lib/uuid/v7.ts";
import * as uuidv7 from "../../../lib/uuid/v7.ts";

export type FollowId = Tagged<UUIDv7, "FollowId">;

export const is = (input: string): input is FollowId => {
  return uuidv7.is(input);
};

export const gen = () => {
  return uuidv7.gen() as FollowId;
};

export const date = (id: FollowId) => {
  return uuidv7.date(id);
};
