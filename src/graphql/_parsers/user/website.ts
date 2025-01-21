import { numChars } from "../../../lib/string/numChars.ts";
import type { MutationUserProfileEditArgs } from "../../../schema.ts";
import { ParseErr, parseArg } from "../../_parsers/util.ts";

type Arg = MutationUserProfileEditArgs["website"];

export const USER_WEBSITE_MAX = 100;

export const parseUserWebsite = parseArg((arg: Arg, argName) => {
  if (arg != null && numChars(arg) > USER_WEBSITE_MAX) {
    return new ParseErr(
      argName,
      `The ${argName} exceeds the maximum number of ${USER_WEBSITE_MAX} characters.`,
    );
  }

  return arg;
});
