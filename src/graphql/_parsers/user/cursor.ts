import { UserId } from "../../../domain/user.ts";
import { parseCursor } from "../cursor.ts";

export const parseUserCursor = parseCursor(UserId.is);
