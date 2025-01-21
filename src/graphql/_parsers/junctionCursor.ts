import { colsSep } from "../_adapters/junctionCursor.ts";

export const parseJunctionCursor = (cursor: string) => {
  return cursor.split(colsSep);
};
