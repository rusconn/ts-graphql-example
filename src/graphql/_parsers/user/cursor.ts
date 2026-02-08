import { User } from "../../../domain.ts";
import { parseCursor } from "../cursor.ts";

export const parseUserCursor = parseCursor(User.Id.is);
