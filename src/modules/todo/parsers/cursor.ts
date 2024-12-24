import * as todoId from "../../../db/models/todo/id.ts";
import { parseCursor } from "../../common/parsers/cursor.ts";

export const parseTodoCursor = parseCursor(todoId.is);
