import { Todo } from "../../../domain/models.ts";
import { parseStringArg } from "../util.ts";

export const parseTodoTitle = parseStringArg(Todo.Title.parse, {
  maxChars: Todo.Title.MAX,
});
