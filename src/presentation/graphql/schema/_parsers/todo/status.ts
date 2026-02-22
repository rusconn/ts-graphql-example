import { Todo } from "../../../../../domain/entities.ts";
import { parseStringArg } from "../_shared/string.ts";

export const parseTodoStatus = parseStringArg(Todo.Status.parse);
