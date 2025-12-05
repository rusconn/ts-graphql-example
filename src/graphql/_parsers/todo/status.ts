import type { TodoStatus } from "../../../schema.ts";
import { parseStringArg } from "../util.ts";

export const parseTodoStatus = parseStringArg<TodoStatus>();
