import * as userId from "../../../datasources/user/types/id.ts";
import { parseCursor } from "../../common/parsers/cursor.ts";

export const parseUserCursor = parseCursor(userId.is);
