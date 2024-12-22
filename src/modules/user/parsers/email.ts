import { isEmail } from "../../../lib/string/isEmail.ts";
import { numChars } from "../../../lib/string/numChars.ts";
import type {
  MutationLoginArgs,
  MutationSignupArgs,
  MutationUpdateAccountArgs,
} from "../../../schema.ts";
import { parseErr } from "../../common/parsers/util.ts";

type Input = {
  email?:
    | MutationSignupArgs["email"]
    | MutationLoginArgs["email"]
    | MutationUpdateAccountArgs["email"];
};

export const USER_EMAIL_MAX = 100;

export const parseUserEmail = <T extends boolean, U extends boolean>(
  { email }: Input,
  { optional, nullable }: { optional: T; nullable: U },
) => {
  if (!optional && email === undefined) {
    return parseErr('"email" is required');
  }
  if (!nullable && email === null) {
    return parseErr('"email" must not be null');
  }
  if (email != null && numChars(email) > USER_EMAIL_MAX) {
    return parseErr(`"email" must be up to ${USER_EMAIL_MAX} characters`);
  }
  if (email != null && !isEmail(email)) {
    return parseErr(`invalid "email"`);
  }

  return email as T extends true
    ? U extends true
      ? Input["email"]
      : Exclude<Input["email"], null>
    : NonNullable<Input["email"]>;
};
