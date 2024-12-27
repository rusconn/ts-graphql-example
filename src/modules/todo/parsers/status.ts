import type { MutationUpdateTodoArgs } from "../../../schema.ts";
import { parseArgs } from "../../common/parsers/util.ts";

type Args = {
  status?: MutationUpdateTodoArgs["status"];
};

export const parseTodoStatus = parseArgs(
  "status",
  (args: Args) => args.status,
  (status) => status,
);
