import type { Like } from "../../../models/like.ts";
import { compositeCursor } from "../compositeCursor.ts";

export const likeCursor = ({ createdAt, userId, postId }: Like) => {
  return compositeCursor(createdAt, userId, postId);
};
