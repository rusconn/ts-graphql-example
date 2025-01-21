import { numChars } from "../../../lib/string/numChars.ts";
import type { MutationUserProfileEditArgs } from "../../../schema.ts";
import { ParseErr, parseArg } from "../../_parsers/util.ts";

type Arg = MutationUserProfileEditArgs["handle"];

export const USER_HANDLE_MAX = 50;

export const parseUserHandle = parseArg((arg: Arg, argName) => {
  if (arg != null && numChars(arg) > USER_HANDLE_MAX) {
    return new ParseErr(
      argName,
      `The ${argName} exceeds the maximum number of ${USER_HANDLE_MAX} characters.`,
    );
  }

  return arg;
});
