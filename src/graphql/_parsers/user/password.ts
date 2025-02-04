import { numChars } from "../../../lib/string/numChars.ts";
import type {
  MutationAccountUpdateArgs,
  MutationLoginArgs,
  MutationSignupArgs,
} from "../../../schema.ts";
import { parseArg, parseErr } from "../util.ts";

type Arg =
  | MutationSignupArgs["password"]
  | MutationLoginArgs["password"]
  | MutationAccountUpdateArgs["password"];

export const USER_PASSWORD_MIN = 8;
export const USER_PASSWORD_MAX = 50;

export const parseUserPassword = parseArg((arg: Arg, argName) => {
  if (arg != null && numChars(arg) < USER_PASSWORD_MIN) {
    return parseErr(`"${argName}" must be at least ${USER_PASSWORD_MIN} characters`);
  }
  if (arg != null && numChars(arg) > USER_PASSWORD_MAX) {
    return parseErr(`"${argName}" must be up to ${USER_PASSWORD_MAX} characters`);
  }

  return arg;
});
