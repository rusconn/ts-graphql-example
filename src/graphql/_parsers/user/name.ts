import { numChars } from "../../../lib/string/numChars.ts";
import * as UserName from "../../../models/user/name.ts";
import type { MutationSignupArgs } from "../../../schema.ts";
import { ParseErr, parseArg } from "../util.ts";

type Arg = MutationSignupArgs["name"];

export const USER_NAME_MIN = 5;
export const USER_NAME_MAX = 15;

export const parseUserNameAdditional = (arg: Arg, argName: string) => {
  if (arg != null && numChars(arg) < USER_NAME_MIN) {
    return new ParseErr(
      argName,
      `The ${argName} is below the minimum number of ${USER_NAME_MIN} characters.`,
    );
  }
  if (arg != null && numChars(arg) > USER_NAME_MAX) {
    return new ParseErr(
      argName,
      `The ${argName} exceeds the maximum number of ${USER_NAME_MAX} characters.`,
    );
  }
  if (arg != null && !UserName.is(arg)) {
    return new ParseErr(argName, `Invalid ${argName}`);
  }

  return arg;
};

export const parseUserName = parseArg(parseUserNameAdditional);
