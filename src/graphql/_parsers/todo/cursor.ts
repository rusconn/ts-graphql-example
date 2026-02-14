import { Todo } from "../../../domain/models.ts";
import { parseCursor } from "../_shared/cursor.ts";

export const parseTodoCursor = parseCursor(Todo.Id.is);
