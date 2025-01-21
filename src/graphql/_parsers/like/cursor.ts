import * as DateUtil from "../../../lib/date/util.ts";
import * as PostId from "../../../models/post/id.ts";
import * as UserId from "../../../models/user/id.ts";
import { parseCompositeCursor } from "../compositeCursor.ts";

export const parseLikeCursor = (cursor: string) => {
  const [createdAt, userId, postId, ...rest] = parseCompositeCursor(cursor);

  if (createdAt == null || userId == null || postId == null || rest.length !== 0) {
    return new Error("Malformed cursor");
  }

  const date = new Date(createdAt);

  if (DateUtil.is(date) || !UserId.is(userId) || !PostId.is(postId)) {
    return new Error("Malformed cursor");
  }

  return { createdAt: date, userId, postId };
};
