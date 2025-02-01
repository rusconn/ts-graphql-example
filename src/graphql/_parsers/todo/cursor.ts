import * as TodoId from "../../../db/models/todo/id.ts";
import { parseCursor } from "../cursor.ts";

export const parseTodoCursor = parseCursor(TodoId.is);
