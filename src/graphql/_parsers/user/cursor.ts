import { UserId } from "../../../models/user.ts";
import { parseCursor } from "../cursor.ts";

export const parseUserCursor = parseCursor(UserId.is);
