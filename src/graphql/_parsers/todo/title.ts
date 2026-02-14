import { Todo } from "../../../domain/models.ts";
import { parseStringArg } from "../_shared/string.ts";

export const parseTodoTitle = parseStringArg(Todo.Title.parse, {
  maxChars: Todo.Title.MAX,
});
