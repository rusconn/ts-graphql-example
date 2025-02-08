import type { Tagged } from "type-fest";

import * as Uuidv7 from "../../lib/uuid/v7.ts";

export type UserToken = Tagged<Uuidv7.Uuidv7, "UserToken">;

export const is = (input: unknown): input is UserToken => {
  return Uuidv7.is(input);
};

export const gen = () => {
  return Uuidv7.gen() as UserToken;
};
