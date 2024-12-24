import type { Tagged } from "type-fest";

import type { UUIDv7 } from "../../../lib/uuid/v7.ts";
import * as uuidv7 from "../../../lib/uuid/v7.ts";

export type UserId = Tagged<UUIDv7, "UserId">;

export const is = (input: string): input is UserId => {
  return uuidv7.is(input);
};

export const gen = () => {
  return uuidv7.gen() as UserId;
};

export const genWithDate = () => {
  return uuidv7.genWithDate() as {
    id: UserId;
    date: Date;
  };
};

export const date = (id: UserId) => {
  return uuidv7.date(id);
};
