import type { Tagged } from "type-fest";
import { v7 } from "uuid";

import type { UUID } from "./vn.ts";
import * as uuid from "./vn.ts";

export type UUIDv7 = Tagged<UUID, "UUIDv7">;

export const gen = () => v7() as UUIDv7;

export const is = (input: string): input is UUIDv7 => {
  return uuid.is(input) && input.charAt(14) === "7";
};

export const genWithDate = () => {
  const id = gen();
  return { id, date: date(id) };
};

export const date = (id: string) => {
  return new Date(decodeTime(id));
};

const decodeTime = (id: string) => {
  const time = id.slice(0, 13).replace("-", "");
  return Number.parseInt(time, 16);
};
