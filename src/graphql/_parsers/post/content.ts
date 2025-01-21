import { numChars } from "../../../lib/string/numChars.ts";
import type {
  MutationPostCreateArgs,
  MutationPostEditArgs,
  MutationPostReplyArgs,
} from "../../../schema.ts";
import { ParseErr, parseArg } from "../util.ts";

type Arg =
  | MutationPostCreateArgs["content"]
  | MutationPostEditArgs["content"]
  | MutationPostReplyArgs["content"];

export const POST_CONTENT_MAX = 280;

export const parsePostContent = parseArg((arg: Arg, argName) => {
  if (arg != null && numChars(arg) > POST_CONTENT_MAX) {
    return new ParseErr(
      argName,
      `The ${argName} exceeds the maximum number of ${POST_CONTENT_MAX} characters.`,
    );
  }

  return arg;
});
