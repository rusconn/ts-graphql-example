import * as todoId from "../../../datasources/todo/types/id.ts";
import { parseCursor } from "../../common/parsers/cursor.ts";

export const parseTodoCursor = parseCursor(todoId.is);
