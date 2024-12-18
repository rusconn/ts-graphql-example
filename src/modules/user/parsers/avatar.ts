import { numChars } from "../../../lib/string/numChars.ts";
import type { MutationEditUserProfileArgs } from "../../../schema.ts";
import { parseArgs, parseErr } from "../../common/parsers/util.ts";

type Args = {
  avatar?: MutationEditUserProfileArgs["avatar"];
};

export const USER_AVATAR_MAX = 300;

export const parseUserAvatar = parseArgs(
  "avatar",
  (args: Args) => args.avatar,
  (avatar) => {
    if (avatar != null && numChars(avatar) > USER_AVATAR_MAX) {
      return parseErr(`"avatar" must be up to ${USER_AVATAR_MAX} characters`);
    }

    return avatar;
  },
);
