import type { Tagged } from "type-fest";

import type { UUIDv7 } from "../../../lib/uuid/v7.ts";
import * as uuidv7 from "../../../lib/uuid/v7.ts";

export type UserToken = Tagged<UUIDv7, "UserToken">;

export const is = (input: string): input is UserToken => {
  return uuidv7.is(input);
};

export const gen = () => {
  return uuidv7.gen() as UserToken;
};
