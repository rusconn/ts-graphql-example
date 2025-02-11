import { numChars } from "../../../lib/string/numChars.ts";
import type {
  MutationAccountUpdateArgs,
  MutationLoginArgs,
  MutationSignupArgs,
} from "../../../schema.ts";
import { ParseErr, parseArg } from "../util.ts";

type Arg =
  | MutationSignupArgs["password"]
  | MutationLoginArgs["password"]
  | MutationAccountUpdateArgs["password"];

export const USER_PASSWORD_MIN = 8;
export const USER_PASSWORD_MAX = 50;

export const parseUserPassword = parseArg((arg: Arg, argName) => {
  if (arg != null && numChars(arg) < USER_PASSWORD_MIN) {
    return new ParseErr(
      argName,
      `The ${argName} is below the minimum number of ${USER_PASSWORD_MIN} characters.`,
    );
  }
  if (arg != null && numChars(arg) > USER_PASSWORD_MAX) {
    return new ParseErr(
      argName,
      `The ${argName} exceeds the maximum number of ${USER_PASSWORD_MAX} characters.`,
    );
  }

  return arg;
});
