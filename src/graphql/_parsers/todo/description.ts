import { numChars } from "../../../lib/string/numChars.ts";
import type { MutationCreateTodoArgs, MutationUpdateTodoArgs } from "../../../schema.ts";
import { parseArgs, parseErr } from "../util.ts";

type Args = {
  description?:
    | MutationCreateTodoArgs["description"] //
    | MutationUpdateTodoArgs["description"];
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
