import { numChars } from "../../../lib/string/numChars.ts";
import * as UserEmail from "../../../models/user/email.ts";
import type {
  MutationLoginArgs,
  MutationSignupArgs,
  MutationUserEmailChangeArgs,
} from "../../../schema.ts";
import { ParseErr, parseArg } from "../util.ts";

type Arg =
  | MutationLoginArgs["loginId"]
  | MutationSignupArgs["email"]
  | MutationUserEmailChangeArgs["email"];

export const USER_EMAIL_MAX = 100;

export const parseUserEmailAdditional = (arg: Arg, argName: string) => {
  if (arg != null && numChars(arg) > USER_EMAIL_MAX) {
    return new ParseErr(
      argName,
      `The ${argName} exceeds the maximum number of ${USER_EMAIL_MAX} characters.`,
    );
  }
  if (arg != null && !UserEmail.is(arg)) {
    return new ParseErr(argName, `Invalid ${argName}.`);
  }

  return arg;
};

export const parseUserEmail = parseArg(parseUserEmailAdditional);
