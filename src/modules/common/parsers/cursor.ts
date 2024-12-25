import { parseErr } from "./util.ts";

export const parseCursor =
  <T extends string>(isCursor: (input: string) => input is T) =>
  (input: string) => {
    if (!isCursor(input)) {
      return parseErr(`invalid cursor: ${input}`);
    }

    return input;
  };
