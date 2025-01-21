import type { Like } from "../../../db/models/like.ts";
import { junctionCursor } from "../junctionCursor.ts";

export const likeCursor = ({ createdAt, userId, postId }: Like) => {
  return junctionCursor(createdAt, userId, postId);
};
