import { numChars } from "../../../lib/string/numChars.ts";
import type {
  MutationLoginArgs,
  MutationSignupArgs,
  MutationUpdateAccountArgs,
} from "../../../schema.ts";
import { parseArgs, parseErr } from "../util.ts";

type Args = {
  password?:
    | MutationSignupArgs["password"]
    | MutationLoginArgs["password"]
    | MutationUpdateAccountArgs["password"];
};

export const USER_PASSWORD_MIN = 8;
export const USER_PASSWORD_MAX = 50;

export const parseUserPassword = parseArgs(
  "password",
  (args: Args) => args.password,
  (password) => {
    if (password != null && numChars(password) < USER_PASSWORD_MIN) {
      return parseErr(`"password" must be at least ${USER_PASSWORD_MIN} characters`);
    }
    if (password != null && numChars(password) > USER_PASSWORD_MAX) {
      return parseErr(`"password" must be up to ${USER_PASSWORD_MAX} characters`);
    }

    return password;
  },
);
