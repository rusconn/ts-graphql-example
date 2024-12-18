import { numChars } from "../../../lib/string/numChars.ts";
import type { MutationEditUserProfileArgs } from "../../../schema.ts";
import { parseErr } from "../../common/parsers/util.ts";

type Input = {
  location?: MutationEditUserProfileArgs["location"];
};

export const USER_LOCATION_MAX = 30;

export const parseUserLocation = <T extends boolean, U extends boolean>(
  { location }: Input,
  { optional, nullable }: { optional: T; nullable: U },
) => {
  if (!optional && location === undefined) {
    return parseErr('"location" is required');
  }
  if (!nullable && location === null) {
    return parseErr('"location" must not be null');
  }
  if (location != null && numChars(location) > USER_LOCATION_MAX) {
    return parseErr(`"location" must be up to ${USER_LOCATION_MAX} characters`);
  }

  return location as T extends true
    ? U extends true
      ? Input["location"]
      : Exclude<Input["location"], null>
    : NonNullable<Input["location"]>;
};
