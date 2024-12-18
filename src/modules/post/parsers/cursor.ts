import { parseCursor } from "../../common/parsers/cursor.ts";
import * as postId from "../internal/id.ts";

export const parsePostCursor = parseCursor(postId.is);
