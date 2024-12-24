import type { Tagged } from "type-fest";

import type { UUIDv7 } from "../../../lib/uuid/v7.ts";
import * as uuidv7 from "../../../lib/uuid/v7.ts";

export type TodoId = Tagged<UUIDv7, "TodoId">;

export const is = (input: string): input is TodoId => {
  return uuidv7.is(input);
};

export const gen = () => {
  return uuidv7.gen() as TodoId;
};

export const genWithDate = () => {
  return uuidv7.genWithDate() as {
    id: TodoId;
    date: Date;
  };
};

export const date = (id: TodoId) => {
  return uuidv7.date(id);
};
