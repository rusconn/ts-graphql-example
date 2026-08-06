import * as Uuid from "./vn.ts";

export function gen(): string {
  return crypto.randomUUID();
}

export function is(input: unknown): boolean {
  return typeof input === "string" && Uuid.is(input) && input.charAt(14) === "4";
}
