import { numChars } from "../../../lib/string/numChars.ts";
import type { MutationEditUserProfileArgs } from "../../../schema.ts";
import { parseErr } from "../../common/parsers/util.ts";

type Input = {
  handle?: MutationEditUserProfileArgs["handle"];
};

export const USER_HANDLE_MAX = 50;

export const parseUserHandle = <T extends boolean, U extends boolean>(
  { handle }: Input,
  { optional, nullable }: { optional: T; nullable: U },
) => {
  if (!optional && handle === undefined) {
    return parseErr('"handle" is required');
  }
  if (!nullable && handle === null) {
    return parseErr('"handle" must not be null');
  }
  if (handle != null && numChars(handle) > USER_HANDLE_MAX) {
    return parseErr(`"handle" must be up to ${USER_HANDLE_MAX} characters`);
  }

  return handle as T extends true
    ? U extends true
      ? Input["handle"]
      : Exclude<Input["handle"], null>
    : NonNullable<Input["handle"]>;
};
