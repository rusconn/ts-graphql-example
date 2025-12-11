import { UserEmail } from "../../../domain/user.ts";
import { ParseErr, parseStringArg } from "../util.ts";

export const USER_EMAIL_MAX = 100;

export const parseUserEmail = parseStringArg({
  maxChars: USER_EMAIL_MAX,
  additionalParse: (s, argName) => {
    if (!UserEmail.is(s)) {
      return new ParseErr(argName, `Invalid ${argName}.`);
    }

    return s;
  },
});
