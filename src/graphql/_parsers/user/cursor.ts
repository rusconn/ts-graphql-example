import * as UserId from "../../../db/models/user/id.ts";
import { cursorSchema } from "../cursor.ts";

export const userCursorSchema = cursorSchema(UserId.is);
