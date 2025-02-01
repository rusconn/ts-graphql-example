import * as UserId from "../../../db/models/user/id.ts";
import { parseCursor } from "../cursor.ts";

export const parseUserCursor = parseCursor(UserId.is);
