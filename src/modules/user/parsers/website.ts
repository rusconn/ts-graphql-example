import { numChars } from "../../../lib/string/numChars.ts";
import type { MutationEditUserProfileArgs } from "../../../schema.ts";
import { parseErr } from "../../common/parsers/util.ts";

type Input = {
  website?: MutationEditUserProfileArgs["website"];
};

export const USER_WEBSITE_MAX = 100;

export const parseUserWebsite = <T extends boolean, U extends boolean>(
  { website }: Input,
  { optional, nullable }: { optional: T; nullable: U },
) => {
  if (!optional && website === undefined) {
    return parseErr('"website" is required');
  }
  if (!nullable && website === null) {
    return parseErr('"website" must not be null');
  }
  if (website != null && numChars(website) > USER_WEBSITE_MAX) {
    return parseErr(`"website" must be up to ${USER_WEBSITE_MAX} characters`);
  }

  return website as T extends true
    ? U extends true
      ? Input["website"]
      : Exclude<Input["website"], null>
    : NonNullable<Input["website"]>;
};
