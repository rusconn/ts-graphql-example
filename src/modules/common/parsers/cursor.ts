import { parseErr } from "./util.ts";

export const parseCursor =
  <T>(isCursor: (input: unknown) => input is T) =>
  (input: unknown) => {
    if (!isCursor(input)) {
      return parseErr(`invalid cursor: ${input}`);
    }

    return input;
  };
