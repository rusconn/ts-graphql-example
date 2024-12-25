import { numChars } from "../../../lib/string/numChars.ts";
import type {
  MutationLoginArgs,
  MutationSignupArgs,
  MutationUpdateAccountArgs,
} from "../../../schema.ts";
import { parseErr } from "../../common/parsers/util.ts";

type Input = {
  password?:
    | MutationSignupArgs["password"]
    | MutationLoginArgs["password"]
    | MutationUpdateAccountArgs["password"];
};

export const USER_PASSWORD_MIN = 8;
export const USER_PASSWORD_MAX = 50;

export const parseUserPassword = <T extends boolean, U extends boolean>(
  { password }: Input,
  { optional, nullable }: { optional: T; nullable: U },
) => {
  if (!optional && password === undefined) {
    return parseErr('"password" is required');
  }
  if (!nullable && password === null) {
    return parseErr('"password" must not be null');
  }
  if (password != null && numChars(password) < USER_PASSWORD_MIN) {
    return parseErr(`"password" must be at least ${USER_PASSWORD_MIN} characters`);
  }
  if (password != null && numChars(password) > USER_PASSWORD_MAX) {
    return parseErr(`"password" must be up to ${USER_PASSWORD_MAX} characters`);
  }

  type Password = typeof password;

  return password as T extends true
    ? U extends true
      ? Password
      : Exclude<Password, null>
    : U extends true
      ? Exclude<Password, undefined>
      : NonNullable<Password>;
};
