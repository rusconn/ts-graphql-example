import * as TodoId from "../../../db/models/todo/id.ts";
import { cursorSchema } from "../cursor.ts";

export const todoCursorSchema = cursorSchema(TodoId.is);
