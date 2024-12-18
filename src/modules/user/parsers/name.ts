import { numChars } from "../../../lib/string/numChars.ts";
import type { MutationChangeUserNameArgs, MutationSignupArgs } from "../../../schema.ts";
import { parseErr } from "../../common/parsers/util.ts";

type Input = {
  name?:
    | MutationSignupArgs["name"] //
    | MutationChangeUserNameArgs["name"];
};

export const USER_NAME_MIN = 5;
export const USER_NAME_MAX = 15;

export const parseUserName = <T extends boolean, U extends boolean>(
  { name }: Input,
  { optional, nullable }: { optional: T; nullable: U },
) => {
  if (!optional && name === undefined) {
    return parseErr('"name" is required');
  }
  if (!nullable && name === null) {
    return parseErr('"name" must not be null');
  }
  if (name != null && numChars(name) < USER_NAME_MIN) {
    return parseErr(`"name" must be at least ${USER_NAME_MIN} characters`);
  }
  if (name != null && numChars(name) > USER_NAME_MAX) {
    return parseErr(`"name" must be up to ${USER_NAME_MAX} characters`);
  }
  if (name != null && !isName(name)) {
    return parseErr(`invalid "name"`);
  }

  return name as T extends true
    ? U extends true
      ? Input["name"]
      : Exclude<Input["name"], null>
    : NonNullable<Input["name"]>;
};

const isName = (input: string) => {
  return /^[a-zA-Z0-9_]+$/.test(input);
};
