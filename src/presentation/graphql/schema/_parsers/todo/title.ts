import { Todo } from "../../../../../domain/entities.ts";
import { parseStringArg } from "../_shared/string.ts";

export const parseTodoTitle = parseStringArg(Todo.Title.parse, {
  maxChars: Todo.Title.MAX,
});
