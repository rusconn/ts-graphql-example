import { numChars } from "../../../lib/string/numChars.ts";
import type { MutationEditUserProfileArgs } from "../../../schema.ts";
import { parseArgs, parseErr } from "../../common/parsers/util.ts";

type Args = {
  handle?: MutationEditUserProfileArgs["handle"];
};

export const USER_HANDLE_MAX = 50;

export const parseUserHandle = parseArgs(
  "handle",
  (args: Args) => args.handle,
  (handle) => {
    if (handle != null && numChars(handle) > USER_HANDLE_MAX) {
      return parseErr(`"handle" must be up to ${USER_HANDLE_MAX} characters`);
    }

    return handle;
  },
);
