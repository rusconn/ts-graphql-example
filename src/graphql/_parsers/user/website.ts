import { numChars } from "../../../lib/string/numChars.ts";
import type { MutationUserProfileEditArgs } from "../../../schema.ts";
import { parseArgs, parseErr } from "../../_parsers/util.ts";

type Args = {
  website?: MutationUserProfileEditArgs["website"];
};

export const USER_WEBSITE_MAX = 100;

export const parseUserWebsite = parseArgs(
  "website",
  (args: Args) => args.website,
  (website) => {
    if (website != null && numChars(website) > USER_WEBSITE_MAX) {
      return parseErr(`"website" must be up to ${USER_WEBSITE_MAX} characters`);
    }

    return website;
  },
);
