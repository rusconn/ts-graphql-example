import { parseCursor } from "../../common/parsers/cursor.ts";
import * as todoId from "../internal/id.ts";

export const parseTodoCursor = parseCursor(todoId.is);
