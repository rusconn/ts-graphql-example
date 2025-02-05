import { numChars } from "../../../lib/string/numChars.ts";
import type { MutationAccountUpdateArgs, MutationSignupArgs } from "../../../schema.ts";
import { parseArg, parseErr } from "../util.ts";

type Arg =
  | MutationSignupArgs["name"] //
  | MutationAccountUpdateArgs["name"];

export const USER_NAME_MIN = 1;
export const USER_NAME_MAX = 100;

export const parseUserName = parseArg((arg: Arg, argName) => {
  if (arg != null && numChars(arg) < USER_NAME_MIN) {
    return parseErr(`The ${argName} is below the minimum number of ${USER_NAME_MIN} characters.`);
  }
  if (arg != null && numChars(arg) > USER_NAME_MAX) {
    return parseErr(`The ${argName} exceeds the maximum number of ${USER_NAME_MAX} characters.`);
  }

  return arg;
});
