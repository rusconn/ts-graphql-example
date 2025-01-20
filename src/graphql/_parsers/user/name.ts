import { numChars } from "../../../lib/string/numChars.ts";
import type { MutationSignupArgs, MutationUpdateAccountArgs } from "../../../schema.ts";
import { parseArgs, parseErr } from "../util.ts";

type Args = {
  name?:
    | MutationSignupArgs["name"] //
    | MutationUpdateAccountArgs["name"];
};

export const USER_NAME_MAX = 100;

export const parseUserName = parseArgs(
  "name",
  (args: Args) => args.name,
  (name) => {
    if (name != null && numChars(name) > USER_NAME_MAX) {
      return parseErr(`"name" must be up to ${USER_NAME_MAX} characters`);
    }

    return name;
  },
);
