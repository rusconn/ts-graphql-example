import type { Tagged } from "type-fest";

import * as Uuidv7 from "../../lib/uuid/v7.ts";

export type PostId = Tagged<Uuidv7.Uuidv7, "PostId">;

export const is = (input: unknown): input is PostId => {
  return Uuidv7.is(input);
};

export const gen = () => {
  return Uuidv7.gen() as PostId;
};

export const genWithDate = () => {
  return Uuidv7.genWithDate() as {
    id: PostId;
    date: Date;
  };
};

export const date = (id: PostId) => {
  return Uuidv7.date(id);
};
