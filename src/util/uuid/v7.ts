import type { Tagged } from "type-fest";
import { v7 } from "uuid";

import * as Uuid from "./vn.ts";

export type Uuidv7 = Tagged<Uuid.Uuid, "v7">;

export function gen() {
  return v7() as Uuidv7;
}

export function is(input: unknown): input is Uuidv7 {
  return Uuid.is(input) && input.charAt(14) === "7";
}

export function genWithDate() {
  const id = gen();
  return { id, date: date(id) };
}

export function date(id: string) {
  return new Date(decodeTime(id));
}

function decodeTime(id: string) {
  const time = id.slice(0, 13).replace("-", "");
  return Number.parseInt(time, 16);
}
