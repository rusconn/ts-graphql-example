import { v7 } from "uuid";

import * as Uuid from "./vn.ts";

export function gen(): string {
  return v7();
}

export function is(input: unknown): boolean {
  return typeof input === "string" && Uuid.is(input) && input.charAt(14) === "7";
}

export function date(id: string) {
  return new Date(decodeTime(id));
}

export function genWithDate() {
  const id = gen();
  return { id, date: date(id) };
}

function decodeTime(id: string) {
  const time = id.slice(0, 13).replace("-", "");
  return Number.parseInt(time, 16);
}
