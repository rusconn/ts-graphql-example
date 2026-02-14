import { User } from "../../../domain/models.ts";
import { parseCursor } from "../_shared/cursor.ts";

export const parseUserCursor = parseCursor(User.Id.is);
