import { Todo } from "../../../domain.ts";
import { parseCursor } from "../cursor.ts";

export const parseTodoCursor = parseCursor(Todo.Id.is);
