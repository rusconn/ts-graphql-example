import { TodoId } from "../../../domain/todo.ts";
import { parseCursor } from "../cursor.ts";

export const parseTodoCursor = parseCursor(TodoId.is);
