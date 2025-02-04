import type { MutationTodoUpdateArgs } from "../../../schema.ts";
import { parseArg } from "../util.ts";

type Arg = MutationTodoUpdateArgs["status"];

export const parseTodoStatus = parseArg((arg: Arg) => arg);
