import type { Block } from "../../../db/models/block.ts";
import { junctionCursor } from "../junctionCursor.ts";

export const blockCursor = ({ createdAt, blockerId, blockeeId }: Block) => {
  return junctionCursor(createdAt, blockerId, blockeeId);
};
