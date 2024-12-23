import * as uuidv7 from "../../../lib/uuid/v7.ts";
import { parseCursor } from "../../common/parsers/cursor.ts";

export const parseTodoCursor = parseCursor(uuidv7.is);
