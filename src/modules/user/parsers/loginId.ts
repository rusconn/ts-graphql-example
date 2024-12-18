import type { MutationLoginArgs } from "../../../schema.ts";
import { parseErr } from "../../common/parsers/util.ts";
import { USER_EMAIL_MAX, parseUserEmail } from "./email.ts";
import { USER_NAME_MAX, parseUserName } from "./name.ts";

type Input = {
  loginId?: MutationLoginArgs["loginId"];
};

export const USER_LOGIN_ID_MAX = Math.max(USER_NAME_MAX, USER_EMAIL_MAX);

export const parseUserLoginId = <T extends boolean, U extends boolean>(
  { loginId }: Input,
  { optional, nullable }: { optional: T; nullable: U },
) => {
  if (!optional && loginId === undefined) {
    return parseErr('"loginId" is required');
  }
  if (!nullable && loginId === null) {
    return parseErr('"loginId" must not be null');
  }

  type Output = T extends true
    ? U extends true
      ? Input["loginId"]
      : Exclude<Input["loginId"], null>
    : NonNullable<Input["loginId"]>;

  const name = parseUserName(
    { name: loginId },
    {
      optional,
      nullable,
    },
  );

  if (!(name instanceof Error)) {
    return name as Output;
  }

  const email = parseUserEmail(
    { email: loginId },
    {
      optional,
      nullable,
    },
  );

  if (!(email instanceof Error)) {
    return email as Output;
  }

  return parseErr(`"loginId" must be name or email`);
};
