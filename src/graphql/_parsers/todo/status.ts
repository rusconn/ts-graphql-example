import { Todo } from "../../../domain/models.ts";
import { parseStringArg } from "../util.ts";

export const parseTodoStatus = parseStringArg(Todo.Status.parse);
