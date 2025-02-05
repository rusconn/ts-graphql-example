import { numChars } from "../../../lib/string/numChars.ts";
import type { MutationTodoCreateArgs, MutationTodoUpdateArgs } from "../../../schema.ts";
import { ParseErr, parseArg } from "../util.ts";

type Arg =
  | MutationTodoCreateArgs["description"] //
  | MutationTodoUpdateArgs["description"];

export const TODO_DESCRIPTION_MAX = 5_000;

export const parseTodoDescription = parseArg((arg: Arg, argName) => {
  if (arg != null && numChars(arg) > TODO_DESCRIPTION_MAX) {
    return new ParseErr(
      argName,
      `The ${argName} exceeds the maximum number of ${TODO_DESCRIPTION_MAX} characters.`,
    );
  }

  return arg;
});
