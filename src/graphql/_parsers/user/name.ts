import * as userName from "../../../db/models/user/name.ts";
import { numChars } from "../../../lib/string/numChars.ts";
import type { MutationSignupArgs, MutationUserNameChangeArgs } from "../../../schema.ts";
import { parseArgs, parseErr } from "../../_parsers/util.ts";

type Args = {
  name?:
    | MutationSignupArgs["name"] //
    | MutationUserNameChangeArgs["name"];
};

export const USER_NAME_MIN = 5;
export const USER_NAME_MAX = 15;

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
    if (name != null && !userName.is(name)) {
      return parseErr(`invalid "name"`);
    }

    return name;
  },
);
