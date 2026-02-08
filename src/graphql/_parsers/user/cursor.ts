import { User } from "../../../domain/models.ts";
import { parseCursor } from "../cursor.ts";

export const parseUserCursor = parseCursor(User.Id.is);
