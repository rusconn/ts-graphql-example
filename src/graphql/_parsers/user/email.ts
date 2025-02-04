import * as UserEmail from "../../../db/models/user/email.ts";
import { numChars } from "../../../lib/string/numChars.ts";
import type {
  MutationAccountUpdateArgs,
  MutationLoginArgs,
  MutationSignupArgs,
} from "../../../schema.ts";
import { parseArg, parseErr } from "../util.ts";

type Arg =
  | MutationSignupArgs["email"]
  | MutationLoginArgs["email"]
  | MutationAccountUpdateArgs["email"];

export const USER_EMAIL_MAX = 100;

export const parseUserEmail = parseArg((arg: Arg, argName) => {
  if (arg != null && numChars(arg) > USER_EMAIL_MAX) {
    return parseErr(`"${argName}" must be up to ${USER_EMAIL_MAX} characters`);
  }
  if (arg != null && !UserEmail.is(arg)) {
    return parseErr(`invalid "${argName}"`);
  }

  return arg;
});
