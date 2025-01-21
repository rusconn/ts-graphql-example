import * as DateUtil from "../../../lib/date/util.ts";
import * as UserId from "../../../models/user/id.ts";
import { parseCompositeCursor } from "../compositeCursor.ts";

export const parseFollowCursor = (cursor: string) => {
  const [createdAt, followerId, followeeId, ...rest] = parseCompositeCursor(cursor);

  if (createdAt == null || followerId == null || followeeId == null || rest.length !== 0) {
    return new Error("Malformed cursor");
  }

  const date = new Date(createdAt);

  if (DateUtil.is(date) || !UserId.is(followerId) || !UserId.is(followeeId)) {
    return new Error("Malformed cursor");
  }

  return { createdAt: date, followerId, followeeId };
};
