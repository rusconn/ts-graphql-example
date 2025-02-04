import { numChars } from "../../../lib/string/numChars.ts";
import type { MutationTodoCreateArgs, MutationTodoUpdateArgs } from "../../../schema.ts";
import { parseArg, parseErr } from "../util.ts";

type Arg =
  | MutationTodoCreateArgs["description"] //
  | MutationTodoUpdateArgs["description"];

export const TODO_DESCRIPTION_MAX = 5_000;

export const parseTodoDescription = parseArg((arg: Arg, argName) => {
  if (arg != null && numChars(arg) > TODO_DESCRIPTION_MAX) {
    return parseErr(`"${argName}" must be up to ${TODO_DESCRIPTION_MAX} characters`);
  }

  return arg;
});
