import * as PostId from "../../../models/post/id.ts";
import { parseCursor } from "../cursor.ts";

export const parsePostCursor = parseCursor(PostId.is);
