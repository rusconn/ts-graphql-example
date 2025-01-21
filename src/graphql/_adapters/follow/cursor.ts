import type { Follow } from "../../../db/models/follow.ts";
import { junctionCursor } from "../junctionCursor.ts";

export const followCursor = ({ createdAt, followerId, followeeId }: Follow) => {
  return junctionCursor(createdAt, followerId, followeeId);
};
