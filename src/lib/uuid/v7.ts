import type { Tagged } from "type-fest";
import { v7 } from "uuid";

import * as Uuid from "./vn.ts";

export type Uuidv7 = Tagged<Uuid.Uuid, "Uuidv7">;

export const gen = () => {
  return v7() as Uuidv7;
};

export const is = (input: unknown): input is Uuidv7 => {
  return Uuid.is(input) && input.charAt(14) === "7";
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
