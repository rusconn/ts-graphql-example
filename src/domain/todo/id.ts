import type { Tagged } from "type-fest";

import * as Uuidv7 from "../../lib/uuid/v7.ts";

export type Type = Tagged<Uuidv7.Uuidv7, "TodoId">;

export const is = (input: unknown): input is Type => {
  return Uuidv7.is(input);
};

export const create = () => {
  return Uuidv7.gen() as Type;
};

export const createWithDate = () => {
  const id = create();
  return {
    id,
    date: date(id),
  };
};

export const date = (id: Type) => {
  return Uuidv7.date(id);
};
