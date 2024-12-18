import { numChars } from "../../../lib/string/numChars.ts";
import type { MutationEditUserProfileArgs } from "../../../schema.ts";
import { parseErr } from "../../common/parsers/util.ts";

type Input = {
  bio?: MutationEditUserProfileArgs["bio"];
};

export const USER_BIO_MAX = 160;

export const parseUserBio = <T extends boolean, U extends boolean>(
  { bio }: Input,
  { optional, nullable }: { optional: T; nullable: U },
) => {
  if (!optional && bio === undefined) {
    return parseErr('"bio" is required');
  }
  if (!nullable && bio === null) {
    return parseErr('"bio" must not be null');
  }
  if (bio != null && numChars(bio) > USER_BIO_MAX) {
    return parseErr(`"bio" must be up to ${USER_BIO_MAX} characters`);
  }

  return bio as T extends true
    ? U extends true
      ? Input["bio"]
      : Exclude<Input["bio"], null>
    : NonNullable<Input["bio"]>;
};
