import { numChars } from "../../../lib/string/numChars.ts";
import type {
  MutationCreatePostArgs,
  MutationEditPostArgs,
  MutationReplyToPostArgs,
} from "../../../schema.ts";
import { parseArgs, parseErr } from "../../common/parsers/util.ts";

type Args = {
  content?:
    | MutationCreatePostArgs["content"] //
    | MutationEditPostArgs["content"]
    | MutationReplyToPostArgs["content"];
};

export const POST_CONTENT_MAX = 280;

export const parsePostContent = parseArgs(
  "content",
  (args: Args) => args.content,
  (content) => {
    if (content != null && numChars(content) > POST_CONTENT_MAX) {
      return parseErr(`"content" must be up to ${POST_CONTENT_MAX} characters`);
    }

    return content;
  },
);
