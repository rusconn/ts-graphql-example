import * as postId from "../../../db/models/post/id.ts";
import { parseCursor } from "../cursor.ts";

export const parsePostCursor = parseCursor(postId.is);
