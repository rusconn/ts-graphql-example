import type { Follow } from "../../../models/follow.ts";
import { compositeCursor } from "../compositeCursor.ts";

export const followCursor = ({ createdAt, followerId, followeeId }: Follow) => {
  return compositeCursor(createdAt, followerId, followeeId);
};
