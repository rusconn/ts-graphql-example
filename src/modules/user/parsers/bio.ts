import { numChars } from "../../../lib/string/numChars.ts";
import type { MutationEditUserProfileArgs } from "../../../schema.ts";
import { parseArgs, parseErr } from "../../common/parsers/util.ts";

type Args = {
  bio?: MutationEditUserProfileArgs["bio"];
};

export const USER_BIO_MAX = 160;

export const parseUserBio = parseArgs(
  "bio",
  (args: Args) => args.bio,
  (bio) => {
    if (bio != null && numChars(bio) > USER_BIO_MAX) {
      return parseErr(`"bio" must be up to ${USER_BIO_MAX} characters`);
    }

    return bio;
  },
);
