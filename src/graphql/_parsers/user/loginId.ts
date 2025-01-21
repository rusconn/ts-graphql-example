import type { MutationLoginArgs } from "../../../schema.ts";
import { ParseErr, parseArg } from "../../_parsers/util.ts";
import { USER_EMAIL_MAX, parseUserEmailAdditional } from "./email.ts";
import { USER_NAME_MAX, parseUserNameAdditional } from "./name.ts";

type Arg = MutationLoginArgs["loginId"];

export const USER_LOGIN_ID_MAX = Math.max(USER_NAME_MAX, USER_EMAIL_MAX);

export const parseUserLoginId = parseArg((arg: Arg, argName) => {
  const name = parseUserNameAdditional(arg, argName);

  if (!(name instanceof ParseErr)) {
    return { type: "name", nameOrEmail: name } as const;
  }

  const email = parseUserEmailAdditional(arg, argName);

  if (!(email instanceof ParseErr)) {
    return { type: "email", nameOrEmail: email } as const;
  }

  return new ParseErr(argName, `${argName} must be a username or email address`);
});
