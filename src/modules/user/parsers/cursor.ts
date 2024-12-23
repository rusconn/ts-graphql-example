import { parseCursor } from "../../common/parsers/cursor.ts";
import * as userId from "../internal/id.ts";

export const parseUserCursor = parseCursor(userId.is);
