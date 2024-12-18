import type { MutationLoginArgs } from "../../../schema.ts";
import { parseArgs, parseErr } from "../../common/parsers/util.ts";
import { USER_EMAIL_MAX, parseUserEmail } from "./email.ts";
import { USER_NAME_MAX, parseUserName } from "./name.ts";

type Args = {
  loginId?: MutationLoginArgs["loginId"];
};

export const USER_LOGIN_ID_MAX = Math.max(USER_NAME_MAX, USER_EMAIL_MAX);

export const parseUserLoginId = parseArgs(
  "loginId",
  (args: Args) => args.loginId,
  (loginId, optional, nullable) => {
    const name = parseUserName(
      { name: loginId }, //
      { optional, nullable },
    );

    if (!(name instanceof Error)) {
      return { type: "name", nameOrEmail: name } as const;
    }

    const email = parseUserEmail(
      { email: loginId }, //
      { optional, nullable },
    );

    if (!(email instanceof Error)) {
      return { type: "email", nameOrEmail: email } as const;
    }

    return parseErr(`"loginId" must be name or email`);
  },
);
