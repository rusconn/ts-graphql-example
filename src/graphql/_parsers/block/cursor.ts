import * as DateUtil from "../../../lib/date/util.ts";
import * as UserId from "../../../models/user/id.ts";
import { parseCompositeCursor } from "../compositeCursor.ts";

export const parseBlockCursor = (cursor: string) => {
  const [createdAt, blockerId, blockeeId, ...rest] = parseCompositeCursor(cursor);

  if (createdAt == null || blockerId == null || blockeeId == null || rest.length !== 0) {
    return new Error("Malformed cursor");
  }

  const date = new Date(createdAt);

  if (DateUtil.is(date) || !UserId.is(blockerId) || !UserId.is(blockeeId)) {
    return new Error("Malformed cursor");
  }

  return { createdAt: date, blockerId, blockeeId };
};
