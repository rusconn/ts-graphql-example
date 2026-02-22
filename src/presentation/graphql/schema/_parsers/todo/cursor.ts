import { Todo } from "../../../../../domain/entities.ts";
import { parseCursor } from "../_shared/cursor.ts";

export const parseTodoCursor = parseCursor(Todo.Id.is);
