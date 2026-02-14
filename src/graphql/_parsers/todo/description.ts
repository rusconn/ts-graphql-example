import { Todo } from "../../../domain/models.ts";
import { parseStringArg } from "../_shared/string.ts";

export const parseTodoDescription = parseStringArg(Todo.Description.parse, {
  maxChars: Todo.Description.MAX,
});
