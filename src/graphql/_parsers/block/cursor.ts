import * as UserId from "../../../db/models/user/id.ts";
import * as DateUtil from "../../../lib/date/util.ts";
import { parseJunctionCursor } from "../junctionCursor.ts";
import { parseErr } from "../util.ts";

export const parseBlockCursor = (cursor: string) => {
  const [createdAt, blockerId, blockeeId, ...rest] = parseJunctionCursor(cursor);

  if (createdAt == null || blockerId == null || blockeeId == null || rest.length !== 0) {
    return parseErr(`invalid cursor: ${cursor}`);
  }

  const date = new Date(createdAt);

  if (DateUtil.is(date) || !UserId.is(blockerId) || !UserId.is(blockeeId)) {
    return parseErr(`invalid cursor: ${cursor}`);
  }

  return { createdAt: date, blockerId, blockeeId };
};
