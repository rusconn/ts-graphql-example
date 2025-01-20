import { numChars } from "../../../lib/string/numChars.ts";
import type { MutationTodoCreateArgs, MutationTodoUpdateArgs } from "../../../schema.ts";
import { parseArgs, parseErr } from "../util.ts";

type Args = {
  title?:
    | MutationTodoCreateArgs["title"] //
    | MutationTodoUpdateArgs["title"];
};

export const TODO_TITLE_MAX = 100;

export const parseTodoTitle = parseArgs(
  "title",
  (args: Args) => args.title,
  (title) => {
    if (title != null && numChars(title) > TODO_TITLE_MAX) {
      return parseErr(`"title" must be up to ${TODO_TITLE_MAX} characters`);
    }

    return title;
  },
);
