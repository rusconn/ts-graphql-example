import { Todo } from "../../../domain/models.ts";
import { parseCursor } from "../cursor.ts";

export const parseTodoCursor = parseCursor(Todo.Id.is);
