import type { MutationTodoUpdateArgs } from "../../../schema.ts";
import { parseArgs } from "../util.ts";

type Args = {
  status?: MutationTodoUpdateArgs["status"];
};

export const parseTodoStatus = parseArgs(
  "status",
  (args: Args) => args.status,
  (status) => status,
);
