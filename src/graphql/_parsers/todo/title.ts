import { numChars } from "../../../lib/string/numChars.ts";
import type { MutationTodoCreateArgs, MutationTodoUpdateArgs } from "../../../schema.ts";
import { ParseErr, parseArg } from "../util.ts";

type Arg =
  | MutationTodoCreateArgs["title"] //
  | MutationTodoUpdateArgs["title"];

export const TODO_TITLE_MAX = 100;

export const parseTodoTitle = parseArg((arg: Arg, argName) => {
  if (arg != null && numChars(arg) > TODO_TITLE_MAX) {
    return new ParseErr(
      argName,
      `The ${argName} exceeds the maximum number of ${TODO_TITLE_MAX} characters.`,
    );
  }

  return arg;
});
