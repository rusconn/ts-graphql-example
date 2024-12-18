import { numChars } from "../../../lib/string/numChars.ts";
import type { MutationEditUserProfileArgs } from "../../../schema.ts";
import { parseErr } from "../../common/parsers/util.ts";

type Input = {
  avatar?: MutationEditUserProfileArgs["avatar"];
};

export const USER_AVATAR_MAX = 300;

export const parseUserAvatar = <T extends boolean, U extends boolean>(
  { avatar }: Input,
  { optional, nullable }: { optional: T; nullable: U },
) => {
  if (!optional && avatar === undefined) {
    return parseErr('"avatar" is required');
  }
  if (!nullable && avatar === null) {
    return parseErr('"avatar" must not be null');
  }
  if (avatar != null && numChars(avatar) > USER_AVATAR_MAX) {
    return parseErr(`"avatar" must be up to ${USER_AVATAR_MAX} characters`);
  }

  return avatar as T extends true
    ? U extends true
      ? Input["avatar"]
      : Exclude<Input["avatar"], null>
    : NonNullable<Input["avatar"]>;
};
