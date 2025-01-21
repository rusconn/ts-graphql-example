import * as UserId from "../../../db/models/user/id.ts";
import * as DateUtil from "../../../lib/date/util.ts";
import { parseJunctionCursor } from "../junctionCursor.ts";
import { parseErr } from "../util.ts";

export const parseFollowCursor = (cursor: string) => {
  const [createdAt, followerId, followeeId, ...rest] = parseJunctionCursor(cursor);

  if (createdAt == null || followerId == null || followeeId == null || rest.length !== 0) {
    return parseErr(`invalid cursor: ${cursor}`);
  }

  const date = new Date(createdAt);

  if (DateUtil.is(date) || !UserId.is(followerId) || !UserId.is(followeeId)) {
    return parseErr(`invalid cursor: ${cursor}`);
  }

  return { createdAt: date, followerId, followeeId };
};
