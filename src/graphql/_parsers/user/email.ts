import * as UserEmail from "../../../db/models/user/email.ts";
import { numChars } from "../../../lib/string/numChars.ts";
import type {
  MutationAccountUpdateArgs,
  MutationLoginArgs,
  MutationSignupArgs,
} from "../../../schema.ts";
import { parseArgs, parseErr } from "../util.ts";

type Args = {
  email?:
    | MutationSignupArgs["email"]
    | MutationLoginArgs["email"]
    | MutationAccountUpdateArgs["email"];
};

export const USER_EMAIL_MAX = 100;

export const parseUserEmail = parseArgs(
  "email",
  (args: Args) => args.email,
  (email) => {
    if (email != null && numChars(email) > USER_EMAIL_MAX) {
      return parseErr(`"email" must be up to ${USER_EMAIL_MAX} characters`);
    }
    if (email != null && !UserEmail.is(email)) {
      return parseErr(`invalid "email"`);
    }

    return email;
  },
);
