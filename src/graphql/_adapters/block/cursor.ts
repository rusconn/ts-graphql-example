import type { Block } from "../../../models/block.ts";
import { compositeCursor } from "../compositeCursor.ts";

export const blockCursor = ({ createdAt, blockerId, blockeeId }: Block) => {
  return compositeCursor(createdAt, blockerId, blockeeId);
};
