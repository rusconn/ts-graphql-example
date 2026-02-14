import { Todo } from "../../../domain/models.ts";
import { parseStringArg } from "../_shared/string.ts";

export const parseTodoStatus = parseStringArg(Todo.Status.parse);
