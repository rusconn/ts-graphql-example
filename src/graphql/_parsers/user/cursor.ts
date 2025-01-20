import * as userId from "../../../db/models/user/id.ts";
import { parseCursor } from "../cursor.ts";

export const parseUserCursor = parseCursor(userId.is);
