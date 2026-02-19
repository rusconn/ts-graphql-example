import { Todo } from "../../../../../domain/entities.ts";
import { parseStringArg } from "../_shared/string.ts";

export const parseTodoDescription = parseStringArg(Todo.Description.parse, {
  maxChars: Todo.Description.MAX,
});
