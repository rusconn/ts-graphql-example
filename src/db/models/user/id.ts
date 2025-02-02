import type { Tagged } from "type-fest";

import * as Uuidv7 from "../../../lib/uuid/v7.ts";

export type UserId = Tagged<Uuidv7.Uuidv7, "UserId">;

export const is = (input: unknown): input is UserId => {
  return Uuidv7.is(input);
};

export const gen = () => {
  return Uuidv7.gen() as UserId;
};

export const genWithDate = () => {
  return Uuidv7.genWithDate() as {
    id: UserId;
    date: Date;
  };
};

export const date = (id: UserId) => {
  return Uuidv7.date(id);
};
