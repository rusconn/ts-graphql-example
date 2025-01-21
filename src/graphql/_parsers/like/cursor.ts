import * as PostId from "../../../db/models/post/id.ts";
import * as UserId from "../../../db/models/user/id.ts";
import * as DateUtil from "../../../lib/date/util.ts";
import { parseJunctionCursor } from "../junctionCursor.ts";
import { parseErr } from "../util.ts";

export const parseLikeCursor = (cursor: string) => {
  const [createdAt, userId, postId, ...rest] = parseJunctionCursor(cursor);

  if (createdAt == null || userId == null || postId == null || rest.length !== 0) {
    return parseErr(`invalid cursor: ${cursor}`);
  }

  const date = new Date(createdAt);

  if (DateUtil.is(date) || !UserId.is(userId) || !PostId.is(postId)) {
    return parseErr(`invalid cursor: ${cursor}`);
  }

  return { createdAt: date, userId, postId };
};
