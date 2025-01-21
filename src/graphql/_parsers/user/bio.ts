import { numChars } from "../../../lib/string/numChars.ts";
import type { MutationUserProfileEditArgs } from "../../../schema.ts";
import { ParseErr, parseArg } from "../../_parsers/util.ts";

type Arg = MutationUserProfileEditArgs["bio"];

export const USER_BIO_MAX = 160;

export const parseUserBio = parseArg((arg: Arg, argName) => {
  if (arg != null && numChars(arg) > USER_BIO_MAX) {
    return new ParseErr(
      argName,
      `The ${argName} exceeds the maximum number of ${USER_BIO_MAX} characters.`,
    );
  }

  return arg;
});
