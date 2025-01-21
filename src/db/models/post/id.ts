import type { Tagged } from "type-fest";

import type { UUIDv7 } from "../../../lib/uuid/v7.ts";
import * as uuidv7 from "../../../lib/uuid/v7.ts";

export type PostId = Tagged<UUIDv7, "PostId">;

export const is = (input: string): input is PostId => {
  return uuidv7.is(input);
};

export const gen = () => {
  return uuidv7.gen() as PostId;
};

export const genWithDate = () => {
  return uuidv7.genWithDate() as {
    id: PostId;
    date: Date;
  };
};

export const date = (id: PostId) => {
  return uuidv7.date(id);
};
