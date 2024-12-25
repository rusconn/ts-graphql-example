import { numChars } from "../../../lib/string/numChars.ts";
import type { MutationSignupArgs, MutationUpdateAccountArgs } from "../../../schema.ts";
import { parseErr } from "../../common/parsers/util.ts";

type Input = {
  name?:
    | MutationSignupArgs["name"] //
    | MutationUpdateAccountArgs["name"];
};

export const USER_NAME_MAX = 100;

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
  if (name != null && numChars(name) > USER_NAME_MAX) {
    return parseErr(`"name" must be up to ${USER_NAME_MAX} characters`);
  }

  type Name = typeof name;

  return name as T extends true
    ? U extends true
      ? Name
      : Exclude<Name, null>
    : U extends true
      ? Exclude<Name, undefined>
      : NonNullable<Name>;
};
