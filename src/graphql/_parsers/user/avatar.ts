import { numChars } from "../../../lib/string/numChars.ts";
import type { MutationUserProfileEditArgs } from "../../../schema.ts";
import { ParseErr, parseArg } from "../../_parsers/util.ts";

type Arg = MutationUserProfileEditArgs["avatar"];

export const USER_AVATAR_MAX = 300;

export const parseUserAvatar = parseArg((arg: Arg, argName) => {
  if (arg != null && numChars(arg) > USER_AVATAR_MAX) {
    return new ParseErr(
      argName,
      `The ${argName} exceeds the maximum number of ${USER_AVATAR_MAX} characters.`,
    );
  }

  return arg;
});
