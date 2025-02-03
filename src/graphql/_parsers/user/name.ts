import * as UserName from "../../../db/models/user/name.ts";
import { numChars } from "../../../lib/string/numChars.ts";
import type { MutationAccountUpdateArgs, MutationSignupArgs } from "../../../schema.ts";
import { parseArgs, parseErr } from "../util.ts";

type Args = {
  name?:
    | MutationSignupArgs["name"] //
    | MutationAccountUpdateArgs["name"];
};

export const USER_NAME_MAX = 100;
export const USER_NAME_MIN = 1;

export const parseUserName = parseArgs(
  "name",
  (args: Args) => args.name,
  (name) => {
    if (name != null && numChars(name) < USER_NAME_MIN) {
      return parseErr(`"name" must be at least ${USER_NAME_MIN} characters`);
    }
    if (name != null && numChars(name) > USER_NAME_MAX) {
      return parseErr(`"name" must be up to ${USER_NAME_MAX} characters`);
    }
    if (name != null && !UserName.is(name)) {
      return parseErr(`invalid "name"`);
    }

    return name;
  },
);
