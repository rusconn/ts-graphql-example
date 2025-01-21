import { numChars } from "../../../lib/string/numChars.ts";
import type { MutationUserProfileEditArgs } from "../../../schema.ts";
import { ParseErr, parseArg } from "../../_parsers/util.ts";

type Arg = MutationUserProfileEditArgs["location"];

export const USER_LOCATION_MAX = 30;

export const parseUserLocation = parseArg((arg: Arg, argName) => {
  if (arg != null && numChars(arg) > USER_LOCATION_MAX) {
    return new ParseErr(
      argName,
      `The ${argName} exceeds the maximum number of ${USER_LOCATION_MAX} characters.`,
    );
  }

  return arg;
});
