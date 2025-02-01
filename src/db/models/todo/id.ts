import type { Tagged } from "type-fest";

import * as Uuidv7 from "../../../lib/uuid/v7.ts";

export type TodoId = Tagged<Uuidv7.Uuidv7, "TodoId">;

export const is = (input: string): input is TodoId => {
  return Uuidv7.is(input);
};

export const gen = () => {
  return Uuidv7.gen() as TodoId;
};

export const genWithDate = () => {
  return Uuidv7.genWithDate() as {
    id: TodoId;
    date: Date;
  };
};

export const date = (id: TodoId) => {
  return Uuidv7.date(id);
};
