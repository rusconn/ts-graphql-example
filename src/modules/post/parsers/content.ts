import { numChars } from "../../../lib/string/numChars.ts";
import type {
  MutationCreatePostArgs,
  MutationEditPostArgs,
  MutationReplyToPostArgs,
} from "../../../schema.ts";
import { parseErr } from "../../common/parsers/util.ts";

type Input = {
  content?:
    | MutationCreatePostArgs["content"] //
    | MutationEditPostArgs["content"]
    | MutationReplyToPostArgs["content"];
};

export const POST_CONTENT_MAX = 280;

export const parsePostContent = <T extends boolean, U extends boolean>(
  { content }: Input,
  { optional, nullable }: { optional: T; nullable: U },
) => {
  if (!optional && content === undefined) {
    return parseErr('"content" is required');
  }
  if (!nullable && content === null) {
    return parseErr('"content" must not be null');
  }
  if (content != null && numChars(content) > POST_CONTENT_MAX) {
    return parseErr(`"content" must be up to ${POST_CONTENT_MAX} characters`);
  }

  return content as T extends true
    ? U extends true
      ? Input["content"]
      : Exclude<Input["content"], null>
    : NonNullable<Input["content"]>;
};
