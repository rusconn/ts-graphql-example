import { parseErr } from "./util.ts";

export const parseCursor =
  <T>(isCursor: (x: unknown) => x is T) =>
  (input: string) => {
    if (!isCursor(input)) {
      return parseErr("Malformed cursor");
    }

    return input;
  };
