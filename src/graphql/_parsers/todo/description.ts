import { numChars } from "../../../lib/string/numChars.ts";
import type { MutationTodoCreateArgs, MutationTodoUpdateArgs } from "../../../schema.ts";
import { parseArgs, parseErr } from "../util.ts";

type Args = {
  description?:
    | MutationTodoCreateArgs["description"] //
    | MutationTodoUpdateArgs["description"];
};

export const TODO_DESCRIPTION_MAX = 5_000;

export const parseTodoDescription = parseArgs(
  "description",
  (args: Args) => args.description,
  (description) => {
    if (description != null && numChars(description) > TODO_DESCRIPTION_MAX) {
      return parseErr(`"description" must be up to ${TODO_DESCRIPTION_MAX} characters`);
    }

    return description;
  },
);
