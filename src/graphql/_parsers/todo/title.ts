import { numChars } from "../../../lib/string/numChars.ts";
import type { MutationTodoCreateArgs, MutationTodoUpdateArgs } from "../../../schema.ts";
import { parseArg, parseErr } from "../util.ts";

type Arg =
  | MutationTodoCreateArgs["title"] //
  | MutationTodoUpdateArgs["title"];

export const TODO_TITLE_MAX = 100;

export const parseTodoTitle = parseArg((arg: Arg, argName) => {
  if (arg != null && numChars(arg) > TODO_TITLE_MAX) {
    return parseErr(`The ${argName} exceeds the maximum number of ${TODO_TITLE_MAX} characters.`);
  }

  return arg;
});
