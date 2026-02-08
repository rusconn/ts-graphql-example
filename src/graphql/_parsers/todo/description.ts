import { Todo } from "../../../domain/models.ts";
import { parseStringArg } from "../util.ts";

export const parseTodoDescription = parseStringArg(Todo.Description.parse, {
  maxChars: Todo.Description.MAX,
});
