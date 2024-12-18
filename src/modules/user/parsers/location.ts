import { numChars } from "../../../lib/string/numChars.ts";
import type { MutationEditUserProfileArgs } from "../../../schema.ts";
import { parseArgs, parseErr } from "../../common/parsers/util.ts";

type Args = {
  location?: MutationEditUserProfileArgs["location"];
};

export const USER_LOCATION_MAX = 30;

export const parseUserLocation = parseArgs(
  "location",
  (args: Args) => args.location,
  (location) => {
    if (location != null && numChars(location) > USER_LOCATION_MAX) {
      return parseErr(`"location" must be up to ${USER_LOCATION_MAX} characters`);
    }

    return location;
  },
);
